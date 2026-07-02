import sqlite3
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables, get_connection
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Optional

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando o Servidor... Verificando o Banco de dados...")
    create_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

from pydantic import BaseModel, Field

class UserAuth(BaseModel):
    username: str
    password: str

class TableCreate(BaseModel):
    name: str

class CharacterCreate(BaseModel):
    table_id: int
    name: str
    classe: str
    level: int = 1
    race: str = ""
    region: str = ""
    age: int = 25
    height: str = "1.75m"
    physical: str = "Atlético"
    color: str = ""
    lore: str = ""
    strength: int = Field(5, alias="str")
    agi: int = 5
    intel: int = Field(5, alias="int")
    vit: int = 5
    sur: int = 5
    mag: int = 5

    class Config:
        populate_by_name = True

class CharacterUpdate(BaseModel):
    lore: Optional[str] = None
    level: Optional[int] = None

class InventoryItemCreate(BaseModel):
    item_name: str
    description: str
    weight: float = 0.0
    quantity: int = 1

@app.post("/api/register")
def register(user_auth: UserAuth):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        import bcrypt
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(user_auth.password.encode('utf-8'), salt).decode('utf-8')
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (user_auth.username, hashed_password))
        conn.commit()
        user_id = cursor.lastrowid
        return {"message": "Registro realizado com sucesso.", "user": {"id": user_id, "username": user_auth.username}}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Usuário já existe.")
    finally:
        conn.close()

@app.post("/api/login")
def login(user_auth: UserAuth):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, password FROM users WHERE username = ?", (user_auth.username,))
    row = cursor.fetchone()
    conn.close()
    if row:
        import bcrypt
        user_id, username, hashed = row
        if bcrypt.checkpw(user_auth.password.encode('utf-8'), hashed.encode('utf-8')):
            return {"message": "Login realizado com sucesso.", "user": {"id": user_id, "username": username}}
    raise HTTPException(status_code=401, detail="Credenciais inválidas.")

# --- TABLES ENDPOINTS ---

@app.get("/api/tables")
def get_tables():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, game_master_id FROM tables")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "name": r[1], "game_master_id": r[2]} for r in rows]

@app.post("/api/tables")
def create_table(table: TableCreate, x_user_id: str = Header(...)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO tables (name, game_master_id) VALUES (?, ?)", (table.name, int(x_user_id)))
        conn.commit()
        table_id = cursor.lastrowid
        return {"id": table_id, "name": table.name, "game_master_id": int(x_user_id)}
    finally:
        conn.close()

# --- CHARACTERS ENDPOINTS ---

@app.get("/api/characters")
def get_characters(x_user_id: str = Header(...)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id, c.user_id, c.table_id, c.name, c.classe, c.level, c.race, c.region, c.age, c.height, c.physical, c.color, c.lore,
               c.str, c.agi, c.int, c.vit, c.sur, c.mag, t.name as table_name
        FROM characters c
        JOIN tables t ON c.table_id = t.id
        WHERE c.user_id = ?
    """, (int(x_user_id),))
    rows = cursor.fetchall()
    conn.close()
    
    chars = []
    for r in rows:
        chars.append({
            "id": r[0], "user_id": r[1], "table_id": r[2], "name": r[3], "classe": r[4], "level": r[5],
            "race": r[6], "region": r[7], "age": r[8], "height": r[9], "physical": r[10], "color": r[11], "lore": r[12],
            "attributes": {"str": r[13], "agi": r[14], "int": r[15], "vit": r[16], "sur": r[17], "mag": r[18]},
            "table_name": r[19]
        })
    return chars

@app.get("/api/characters/{char_id}")
def get_character(char_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id, c.user_id, c.table_id, c.name, c.classe, c.level, c.race, c.region, c.age, c.height, c.physical, c.color, c.lore,
               c.str, c.agi, c.int, c.vit, c.sur, c.mag, t.name as table_name
        FROM characters c
        JOIN tables t ON c.table_id = t.id
        WHERE c.id = ?
    """, (char_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        raise HTTPException(status_code=404, detail="Personagem não encontrado.")
    return {
        "id": r[0], "user_id": r[1], "table_id": r[2], "name": r[3], "classe": r[4], "level": r[5],
        "race": r[6], "region": r[7], "age": r[8], "height": r[9], "physical": r[10], "color": r[11], "lore": r[12],
        "attributes": {"str": r[13], "agi": r[14], "int": r[15], "vit": r[16], "sur": r[17], "mag": r[18]},
        "table_name": r[19]
    }

@app.post("/api/characters")
def create_character(char: CharacterCreate, x_user_id: str = Header(...)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO characters (
                user_id, table_id, name, classe, level, race, region, age, height, physical, color, lore,
                str, agi, int, vit, sur, mag
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            int(x_user_id), char.table_id, char.name, char.classe, char.level, char.race, char.region, char.age, char.height, char.physical, char.color, char.lore,
            char.strength, char.agi, char.intel, char.vit, char.sur, char.mag
        ))
        conn.commit()
        char_id = cursor.lastrowid
        return {"id": char_id, "message": "Personagem criado com sucesso."}
    finally:
        conn.close()

@app.put("/api/characters/{char_id}")
def update_character(char_id: int, char_up: CharacterUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if char_up.lore is not None:
            cursor.execute("UPDATE characters SET lore = ? WHERE id = ?", (char_up.lore, char_id))
        if char_up.level is not None:
            cursor.execute("UPDATE characters SET level = ? WHERE id = ?", (char_up.level, char_id))
        conn.commit()
        return {"message": "Personagem atualizado com sucesso."}
    finally:
        conn.close()

@app.delete("/api/characters/{char_id}")
def delete_character(char_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM inventory WHERE character_id = ?", (char_id,))
        cursor.execute("DELETE FROM characters WHERE id = ?", (char_id,))
        conn.commit()
        return {"message": "Personagem deletado."}
    finally:
        conn.close()

# --- INVENTORY ENDPOINTS ---

@app.get("/api/characters/{char_id}/inventory")
def get_inventory(char_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, item_name, description, weight, quantity FROM inventory WHERE character_id = ?", (char_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "item_name": r[1], "description": r[2], "weight": r[3], "quantity": r[4]} for r in rows]

@app.post("/api/characters/{char_id}/inventory")
def add_inventory_item(char_id: int, item: InventoryItemCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO inventory (character_id, item_name, description, weight, quantity) VALUES (?, ?, ?, ?, ?)", 
                       (char_id, item.item_name, item.description, item.weight, item.quantity))
        conn.commit()
        item_id = cursor.lastrowid
        return {"id": item_id, "item_name": item.item_name, "description": item.description, "weight": item.weight, "quantity": item.quantity}
    finally:
        conn.close()

@app.delete("/api/inventory/{item_id}")
def delete_inventory_item(item_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM inventory WHERE id = ?", (item_id,))
        conn.commit()
        return {"message": "Item removido do inventário."}
    finally:
        conn.close()