from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from contextlib import asynccontextmanager
from pydantic import BaseModel
from models.character import Character
from controllers import auth_controller

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando o Servidor... Verificando o Banco de dados...")
    create_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class UserAuth(BaseModel):
    username: str
    password: str

@app.post("/api/login")
def login(user_auth: UserAuth):
    user = auth_controller.login(user_auth.username, user_auth.password)
    if user:
        return {"message": "Login realizado com sucesso.", "user": user}
    else:
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    
@app.post("/api/register")
def register(user_auth: UserAuth):
    user = auth_controller.register(user_auth.username, user_auth.password)
    if user:
        return {"message": "Registro realizado com sucesso.", "user": {"id": user.id, "username": user.username}}
    else:
        raise HTTPException(status_code=400, detail="Erro ao registrar usuário.")

@app.get("/api/characters/{char_id}/inventory")
def get_inventory(char_id: int):
    character = Character.get_character_by_id(char_id)
    if character:
        inventory = character.get_inventory_details()
        return {"sucesso": True, "inventory": inventory}
    else:
        return {"sucesso": False, "error": "Personagem não encontrado."}