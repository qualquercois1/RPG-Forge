import sqlite3
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables, get_connection
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from typing import Optional, List

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

class UserAuth(BaseModel):
    username: str
    password: str

class TableCreate(BaseModel):
    name: str

class StartingItem(BaseModel):
    item_name: str
    description: str
    weight: float = 0.0
    quantity: int = 1

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
    alive: int = 1
    hp: Optional[int] = None
    max_hp: Optional[int] = None
    starting_items: Optional[List[StartingItem]] = []

    class Config:
        populate_by_name = True

class CharacterUpdate(BaseModel):
    lore: Optional[str] = None
    level: Optional[int] = None
    hp: Optional[int] = None
    max_hp: Optional[int] = None
    alive: Optional[int] = None

class InventoryItemCreate(BaseModel):
    item_name: str
    description: str
    weight: float = 0.0
    quantity: int = 1

class TableItemCreate(BaseModel):
    item_name: str
    description: str
    weight: float = 0.0

class AssignTableItem(BaseModel):
    character_id: int
    quantity: int = 1

class SessionCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class SessionLogCreate(BaseModel):
    event_text: str

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

def check_table_access(table_id: int, user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Check if GM
        cursor.execute("SELECT game_master_id FROM tables WHERE id = ?", (table_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Mesa não encontrada.")
        gm_id = row[0]
        if gm_id == user_id:
            return True
        
        # Check if invited & accepted
        cursor.execute("SELECT id FROM table_invitations WHERE table_id = ? AND user_id = ? AND status = 'accepted'", (table_id, user_id))
        if cursor.fetchone():
            return True
        
        raise HTTPException(status_code=403, detail="Você não tem permissão para acessar esta mesa. É necessário ser convidado pelo mestre.")
    finally:
        conn.close()

@app.get("/api/tables")
def get_tables(x_user_id: Optional[str] = Header(None)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if x_user_id:
            uid = int(x_user_id)
            cursor.execute("""
                SELECT t.id, t.name, t.game_master_id 
                FROM tables t
                LEFT JOIN table_invitations ti ON t.id = ti.table_id AND ti.user_id = ?
                WHERE t.game_master_id = ? OR ti.status = 'accepted'
                GROUP BY t.id
            """, (uid, uid))
        else:
            cursor.execute("SELECT id, name, game_master_id FROM tables")
        rows = cursor.fetchall()
        return [{"id": r[0], "name": r[1], "game_master_id": r[2]} for r in rows]
    finally:
        conn.close()

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
               c.str, c.agi, c.int, c.vit, c.sur, c.mag, c.alive, c.hp, c.max_hp, t.name as table_name
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
            "alive": r[19], "hp": r[20], "max_hp": r[21], "table_name": r[22]
        })
    return chars

@app.get("/api/characters/{char_id}")
def get_character(char_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id, c.user_id, c.table_id, c.name, c.classe, c.level, c.race, c.region, c.age, c.height, c.physical, c.color, c.lore,
               c.str, c.agi, c.int, c.vit, c.sur, c.mag, c.alive, c.hp, c.max_hp, t.name as table_name, u.username
        FROM characters c
        JOIN tables t ON c.table_id = t.id
        JOIN users u ON c.user_id = u.id
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
        "alive": r[19], "hp": r[20], "max_hp": r[21], "table_name": r[22], "owner_username": r[23]
    }

@app.get("/api/tables/{table_id}/characters")
def get_table_characters(table_id: int, x_user_id: str = Header(...)):
    check_table_access(table_id, int(x_user_id))
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id, c.user_id, c.table_id, c.name, c.classe, c.level, c.race, c.region, c.age, c.height, c.physical, c.color, c.lore,
               c.str, c.agi, c.int, c.vit, c.sur, c.mag, c.alive, c.hp, c.max_hp, u.username
        FROM characters c
        JOIN users u ON c.user_id = u.id
        WHERE c.table_id = ?
    """, (table_id,))
    rows = cursor.fetchall()
    conn.close()
    
    chars = []
    for r in rows:
        chars.append({
            "id": r[0], "user_id": r[1], "table_id": r[2], "name": r[3], "classe": r[4], "level": r[5],
            "race": r[6], "region": r[7], "age": r[8], "height": r[9], "physical": r[10], "color": r[11], "lore": r[12],
            "attributes": {"str": r[13], "agi": r[14], "int": r[15], "vit": r[16], "sur": r[17], "mag": r[18]},
            "alive": r[19], "hp": r[20], "max_hp": r[21], "owner_username": r[22]
        })
    return chars

@app.post("/api/characters")
def create_character(char: CharacterCreate, x_user_id: str = Header(...)):
    uid = int(x_user_id)
    check_table_access(char.table_id, uid)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # 1. Obter game_master_id da mesa
        cursor.execute("SELECT game_master_id FROM tables WHERE id = ?", (char.table_id,))
        row_table = cursor.fetchone()
        if not row_table:
            raise HTTPException(status_code=404, detail="Mesa não encontrada.")
        
        gm_id = row_table[0]

        # 2. Se NÃO for o mestre (GM), verificar se já possui um personagem VIVO nesta mesa
        if uid != gm_id:
            cursor.execute("SELECT count(*) FROM characters WHERE user_id = ? AND table_id = ? AND alive = 1", (uid, char.table_id))
            count = cursor.fetchone()[0]
            if count > 0:
                raise HTTPException(
                    status_code=400, 
                    detail="Você já possui um personagem VIVO nesta mesa. Só é permitido um por jogador até que ele morra."
                )

        # 3. Definir Vida (HP) baseado na Vitalidade se não fornecido
        max_hp = char.max_hp if char.max_hp is not None else char.vit * 10
        hp = char.hp if char.hp is not None else max_hp

        cursor.execute("""
            INSERT INTO characters (
                user_id, table_id, name, classe, level, race, region, age, height, physical, color, lore,
                str, agi, int, vit, sur, mag, alive, hp, max_hp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            uid, char.table_id, char.name, char.classe, char.level, char.race, char.region, char.age, char.height, char.physical, char.color, char.lore,
            char.strength, char.agi, char.intel, char.vit, char.sur, char.mag, char.alive, hp, max_hp
        ))
        conn.commit()
        char_id = cursor.lastrowid

        if char.starting_items:
            for it in char.starting_items:
                cursor.execute("""
                    INSERT INTO inventory (character_id, item_name, description, weight, quantity)
                    VALUES (?, ?, ?, ?, ?)
                """, (char_id, it.item_name, it.description, it.weight, it.quantity))
            conn.commit()

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
        if char_up.hp is not None:
            hp_val = char_up.hp
            # Se a vida chegar a 0, define vivo como falso (0) automaticamente
            alive_val = 0 if hp_val <= 0 else 1
            if char_up.alive is not None:
                alive_val = char_up.alive
            cursor.execute("UPDATE characters SET hp = ?, alive = ? WHERE id = ?", (hp_val, alive_val, char_id))
        elif char_up.alive is not None:
            cursor.execute("UPDATE characters SET alive = ? WHERE id = ?", (char_up.alive, char_id))
        
        if char_up.max_hp is not None:
            cursor.execute("UPDATE characters SET max_hp = ? WHERE id = ?", (char_up.max_hp, char_id))

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
        # Check if item with same name exists for this character
        cursor.execute("SELECT id, quantity FROM inventory WHERE character_id = ? AND item_name = ?", (char_id, item.item_name))
        row = cursor.fetchone()
        if row:
            inv_id, qty = row
            new_qty = qty + item.quantity
            cursor.execute("UPDATE inventory SET quantity = ? WHERE id = ?", (new_qty, inv_id))
            conn.commit()
            return {"id": inv_id, "item_name": item.item_name, "description": item.description, "weight": item.weight, "quantity": new_qty}
        else:
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

# --- SESSIONS & EVENT LOGS ENDPOINTS ---

@app.get("/api/tables/{table_id}/sessions")
def get_sessions(table_id: int, x_user_id: str = Header(...)):
    check_table_access(table_id, int(x_user_id))
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, table_id, name, description, created_at FROM sessions WHERE table_id = ? ORDER BY id DESC", (table_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "table_id": r[1], "name": r[2], "description": r[3], "created_at": r[4]} for r in rows]

@app.post("/api/tables/{table_id}/sessions")
def create_session(table_id: int, session: SessionCreate, x_user_id: str = Header(...)):
    check_table_access(table_id, int(x_user_id))
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO sessions (table_id, name, description) VALUES (?, ?, ?)", (table_id, session.name, session.description))
        conn.commit()
        session_id = cursor.lastrowid
        return {"id": session_id, "table_id": table_id, "name": session.name, "description": session.description}
    finally:
        conn.close()

@app.get("/api/sessions/{session_id}/logs")
def get_session_logs(session_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, session_id, user_id, username, event_text, created_at FROM session_logs WHERE session_id = ? ORDER BY id ASC", (session_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "session_id": r[1], "user_id": r[2], "username": r[3], "event_text": r[4], "created_at": r[5]} for r in rows]

@app.post("/api/sessions/{session_id}/logs")
def create_session_log(session_id: int, log: SessionLogCreate, x_user_id: str = Header(...)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Obter nome do usuário
        cursor.execute("SELECT username FROM users WHERE id = ?", (int(x_user_id),))
        row = cursor.fetchone()
        username = row[0] if row else "Desconhecido"

        cursor.execute("INSERT INTO session_logs (session_id, user_id, username, event_text) VALUES (?, ?, ?, ?)", 
                       (session_id, int(x_user_id), username, log.event_text))
        conn.commit()
        log_id = cursor.lastrowid
        return {"id": log_id, "session_id": session_id, "user_id": int(x_user_id), "username": username, "event_text": log.event_text}
    finally:
        conn.close()

# --- TABLE ITEMS (GM TEMPLATES) ENDPOINTS ---

@app.get("/api/tables/{table_id}/items")
def get_table_items(table_id: int, x_user_id: str = Header(...)):
    check_table_access(table_id, int(x_user_id))
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, table_id, item_name, description, weight FROM table_items WHERE table_id = ?", (table_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "table_id": r[1], "item_name": r[2], "description": r[3], "weight": r[4]} for r in rows]

@app.post("/api/tables/{table_id}/items")
def create_table_item(table_id: int, item: TableItemCreate, x_user_id: str = Header(...)):
    check_table_access(table_id, int(x_user_id))
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO table_items (table_id, item_name, description, weight) VALUES (?, ?, ?, ?)",
                       (table_id, item.item_name, item.description, item.weight))
        conn.commit()
        item_id = cursor.lastrowid
        return {"id": item_id, "table_id": table_id, "item_name": item.item_name, "description": item.description, "weight": item.weight}
    finally:
        conn.close()

@app.post("/api/tables/{table_id}/items/{item_id}/assign")
def assign_table_item(table_id: int, item_id: int, assign: AssignTableItem):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT item_name, description, weight FROM table_items WHERE id = ? AND table_id = ?", (item_id, table_id))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Item da mesa não encontrado.")
        
        item_name, description, weight = row

        # Check if item with same name exists for this character
        cursor.execute("SELECT id, quantity FROM inventory WHERE character_id = ? AND item_name = ?", (assign.character_id, item_name))
        row_inv = cursor.fetchone()
        if row_inv:
            inv_id, qty = row_inv
            new_qty = qty + assign.quantity
            cursor.execute("UPDATE inventory SET quantity = ? WHERE id = ?", (new_qty, inv_id))
            conn.commit()
            return {"id": inv_id, "character_id": assign.character_id, "item_name": item_name, "description": description, "weight": weight, "quantity": new_qty}
        else:
            cursor.execute("""
                INSERT INTO inventory (character_id, item_name, description, weight, quantity)
                VALUES (?, ?, ?, ?, ?)
            """, (assign.character_id, item_name, description, weight, assign.quantity))
            conn.commit()
            inv_id = cursor.lastrowid
            return {"id": inv_id, "character_id": assign.character_id, "item_name": item_name, "description": description, "weight": weight, "quantity": assign.quantity}
    finally:
        conn.close()

@app.delete("/api/table-items/{item_id}")
def delete_table_item(item_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM table_items WHERE id = ?", (item_id,))
        conn.commit()
        return {"message": "Item removido da lista da mesa."}
    finally:
        conn.close()

# --- DELETE SESSION LOG ENTRY ---

@app.delete("/api/session-logs/{log_id}")
def delete_session_log(log_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM session_logs WHERE id = ?", (log_id,))
        conn.commit()
        return {"message": "Mensagem do diário removida."}
    finally:
        conn.close()

# --- FRIENDSHIP & NOTIFICATION ENDPOINTS ---

class FriendRequestSend(BaseModel):
    username: str

@app.post("/api/friends/request")
def send_friend_request(req: FriendRequestSend, x_user_id: str = Header(...)):
    sender_id = int(x_user_id)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Find receiver by username
        cursor.execute("SELECT id FROM users WHERE username = ?", (req.username,))
        row_receiver = cursor.fetchone()
        if not row_receiver:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        
        receiver_id = row_receiver[0]
        
        if sender_id == receiver_id:
            raise HTTPException(status_code=400, detail="Você não pode enviar convite de amizade para si mesmo.")
        
        # Check if already friends
        u1, u2 = min(sender_id, receiver_id), max(sender_id, receiver_id)
        cursor.execute("SELECT id FROM friendships WHERE user_id_1 = ? AND user_id_2 = ?", (u1, u2))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Vocês já são amigos.")
        
        # Check if there is already a pending request
        cursor.execute("SELECT id, status, sender_id FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
                       (sender_id, receiver_id, receiver_id, sender_id))
        row_req = cursor.fetchone()
        if row_req:
            req_id, status, req_sender_id = row_req
            if status == "pending":
                if req_sender_id == sender_id:
                    raise HTTPException(status_code=400, detail="Convite de amizade já enviado e pendente.")
                else:
                    raise HTTPException(status_code=400, detail="Este usuário já enviou um convite para você. Aceite-o na aba de pendentes.")
            else:
                raise HTTPException(status_code=400, detail="Já existe uma solicitação entre vocês.")

        # Insert new request
        cursor.execute("INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, 'pending')", (sender_id, receiver_id))
        conn.commit()
        return {"message": "Solicitação de amizade enviada com sucesso."}
    finally:
        conn.close()

@app.get("/api/friends/requests/pending")
def get_pending_requests(x_user_id: str = Header(...)):
    user_id = int(x_user_id)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT fr.id, fr.sender_id, u.username 
            FROM friend_requests fr
            JOIN users u ON fr.sender_id = u.id
            WHERE fr.receiver_id = ? AND fr.status = 'pending'
        """, (user_id,))
        rows = cursor.fetchall()
        return [{"id": r[0], "sender_id": r[1], "username": r[2]} for r in rows]
    finally:
        conn.close()

@app.post("/api/friends/requests/{request_id}/accept")
def accept_friend_request(request_id: int, x_user_id: str = Header(...)):
    user_id = int(x_user_id)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Find request
        cursor.execute("SELECT sender_id, receiver_id FROM friend_requests WHERE id = ?", (request_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Solicitação de amizade não encontrada.")
        
        sender_id, receiver_id = row
        if receiver_id != user_id:
            raise HTTPException(status_code=403, detail="Você não tem permissão para aceitar este convite.")
        
        # Add to friendships
        u1, u2 = min(sender_id, receiver_id), max(sender_id, receiver_id)
        try:
            cursor.execute("INSERT INTO friendships (user_id_1, user_id_2) VALUES (?, ?)", (u1, u2))
        except sqlite3.IntegrityError:
            pass # Already friends
        
        # Delete from friend_requests
        cursor.execute("DELETE FROM friend_requests WHERE id = ?", (request_id,))
        conn.commit()
        return {"message": "Solicitação de amizade aceita."}
    finally:
        conn.close()

@app.post("/api/friends/requests/{request_id}/decline")
def decline_friend_request(request_id: int, x_user_id: str = Header(...)):
    user_id = int(x_user_id)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT receiver_id FROM friend_requests WHERE id = ?", (request_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Solicitação de amizade não encontrada.")
        
        if row[0] != user_id:
            raise HTTPException(status_code=403, detail="Você não tem permissão para recusar este convite.")
        
        cursor.execute("DELETE FROM friend_requests WHERE id = ?", (request_id,))
        conn.commit()
        return {"message": "Solicitação de amizade recusada."}
    finally:
        conn.close()

@app.get("/api/friends")
def get_friends(x_user_id: str = Header(...)):
    user_id = int(x_user_id)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT u.id, u.username 
            FROM friendships f
            JOIN users u ON (f.user_id_1 = u.id OR f.user_id_2 = u.id)
            WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) AND u.id != ?
        """, (user_id, user_id, user_id))
        rows = cursor.fetchall()
        return [{"id": r[0], "username": r[1]} for r in rows]
    finally:
        conn.close()

@app.delete("/api/friends/{friend_id}")
def delete_friend(friend_id: int, x_user_id: str = Header(...)):
    user_id = int(x_user_id)
    u1, u2 = min(user_id, friend_id), max(user_id, friend_id)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM friendships WHERE user_id_1 = ? AND user_id_2 = ?", (u1, u2))
        conn.commit()
        return {"message": "Amigo removido com sucesso."}
    finally:
        conn.close()

# --- ADMIN ENDPOINTS ---

def check_admin(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT username FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if not row or row[0] != "admin":
            raise HTTPException(status_code=403, detail="Acesso negado. Apenas o usuário 'admin' pode realizar esta ação.")
    finally:
        conn.close()

@app.get("/api/admin/summary")
def get_admin_summary(x_user_id: str = Header(...)):
    uid = int(x_user_id)
    check_admin(uid)
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Users
        cursor.execute("SELECT id, username FROM users")
        users = [{"id": r[0], "username": r[1]} for r in cursor.fetchall()]
        
        # Tables
        cursor.execute("""
            SELECT t.id, t.name, t.game_master_id, u.username 
            FROM tables t
            JOIN users u ON t.game_master_id = u.id
        """)
        tables = [{"id": r[0], "name": r[1], "game_master_id": r[2], "game_master_username": r[3]} for r in cursor.fetchall()]
        
        # Characters
        cursor.execute("""
            SELECT c.id, c.name, c.classe, c.level, c.user_id, u.username, c.table_id, t.name
            FROM characters c
            JOIN users u ON c.user_id = u.id
            JOIN tables t ON c.table_id = t.id
        """)
        characters = [{
            "id": r[0], "name": r[1], "classe": r[2], "level": r[3],
            "user_id": r[4], "username": r[5], "table_id": r[6], "table_name": r[7]
        } for r in cursor.fetchall()]
        
        return {
            "users": users,
            "tables": tables,
            "characters": characters
        }
    finally:
        conn.close()

@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: int, x_user_id: str = Header(...)):
    uid = int(x_user_id)
    check_admin(uid)
    
    if user_id == uid:
        raise HTTPException(status_code=400, detail="Você não pode deletar a si mesmo.")
        
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        return {"message": "Usuário deletado pelo administrador."}
    finally:
        conn.close()

@app.delete("/api/admin/tables/{table_id}")
def admin_delete_table(table_id: int, x_user_id: str = Header(...)):
    uid = int(x_user_id)
    check_admin(uid)
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM tables WHERE id = ?", (table_id,))
        conn.commit()
        return {"message": "Mesa deletada pelo administrador."}
    finally:
        conn.close()

@app.delete("/api/admin/characters/{char_id}")
def admin_delete_character(char_id: int, x_user_id: str = Header(...)):
    uid = int(x_user_id)
    check_admin(uid)
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM characters WHERE id = ?", (char_id,))
        conn.commit()
        return {"message": "Personagem deletado pelo administrador."}
    finally:
        conn.close()

# --- TABLE INVITATION ENDPOINTS ---

class TableInviteSend(BaseModel):
    username: str

@app.post("/api/tables/{table_id}/invite")
def invite_to_table(table_id: int, invite: TableInviteSend, x_user_id: str = Header(...)):
    uid = int(x_user_id)
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Check if caller is GM of this table
        cursor.execute("SELECT game_master_id FROM tables WHERE id = ?", (table_id,))
        row_table = cursor.fetchone()
        if not row_table:
            raise HTTPException(status_code=404, detail="Mesa não encontrada.")
        if row_table[0] != uid:
            raise HTTPException(status_code=403, detail="Apenas o mestre (GM) da mesa pode enviar convites.")
        
        # Check if target user exists
        cursor.execute("SELECT id FROM users WHERE username = ?", (invite.username,))
        row_user = cursor.fetchone()
        if not row_user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        receiver_id = row_user[0]
        
        if receiver_id == uid:
            raise HTTPException(status_code=400, detail="Você não precisa convidar a si mesmo (você é o mestre).")
        
        # Check if already invited or joined
        cursor.execute("SELECT id, status FROM table_invitations WHERE table_id = ? AND user_id = ?", (table_id, receiver_id))
        row_inv = cursor.fetchone()
        if row_inv:
            inv_id, status = row_inv
            if status == "pending":
                raise HTTPException(status_code=400, detail="Este jogador já possui um convite pendente para esta mesa.")
            else:
                raise HTTPException(status_code=400, detail="Este jogador já está participando desta mesa.")

        # Create invite
        cursor.execute("INSERT INTO table_invitations (table_id, user_id, status) VALUES (?, ?, 'pending')", (table_id, receiver_id))
        conn.commit()
        return {"message": "Convite enviado com sucesso."}
    finally:
        conn.close()

@app.get("/api/tables/{table_id}/invitations")
def get_table_invitations(table_id: int, x_user_id: str = Header(...)):
    uid = int(x_user_id)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Check if GM
        cursor.execute("SELECT game_master_id FROM tables WHERE id = ?", (table_id,))
        row_table = cursor.fetchone()
        if not row_table or row_table[0] != uid:
            raise HTTPException(status_code=403, detail="Acesso negado.")
        
        cursor.execute("""
            SELECT ti.id, u.username, ti.status 
            FROM table_invitations ti
            JOIN users u ON ti.user_id = u.id
            WHERE ti.table_id = ?
        """, (table_id,))
        rows = cursor.fetchall()
        return [{"id": r[0], "username": r[1], "status": r[2]} for r in rows]
    finally:
        conn.close()

@app.get("/api/invitations")
def get_user_table_invitations(x_user_id: str = Header(...)):
    uid = int(x_user_id)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT ti.id, t.name, u.username 
            FROM table_invitations ti
            JOIN tables t ON ti.table_id = t.id
            JOIN users u ON t.game_master_id = u.id
            WHERE ti.user_id = ? AND ti.status = 'pending'
        """, (uid,))
        rows = cursor.fetchall()
        return [{"id": r[0], "table_name": r[1], "gm_username": r[2]} for r in rows]
    finally:
        conn.close()

@app.post("/api/invitations/{invite_id}/accept")
def accept_table_invitation(invite_id: int, x_user_id: str = Header(...)):
    uid = int(x_user_id)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT user_id FROM table_invitations WHERE id = ?", (invite_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Convite não encontrado.")
        if row[0] != uid:
            raise HTTPException(status_code=403, detail="Você não tem permissão para aceitar este convite.")
        
        cursor.execute("UPDATE table_invitations SET status = 'accepted' WHERE id = ?", (invite_id,))
        conn.commit()
        return {"message": "Convite aceito com sucesso."}
    finally:
        conn.close()

@app.post("/api/invitations/{invite_id}/decline")
def decline_table_invitation(invite_id: int, x_user_id: str = Header(...)):
    uid = int(x_user_id)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT user_id FROM table_invitations WHERE id = ?", (invite_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Convite não encontrado.")
        if row[0] != uid:
            raise HTTPException(status_code=403, detail="Você não tem permissão para recusar este convite.")
        
        cursor.execute("DELETE FROM table_invitations WHERE id = ?", (invite_id,))
        conn.commit()
        return {"message": "Convite recusado."}
    finally:
        conn.close()