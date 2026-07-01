import sqlite3
from database import get_connection
from models.character import Character

class User:
    def __init__(self, username, password, user_id=None):
        self.id = user_id
        self.username = username
        self.password = password

    def save(self):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (self.username, self.password))
            conn.commit()
            self.id = cursor.lastrowid
            return self
        except sqlite3.IntegrityError:
            print("Erro: Nome de usuário já existe.")
            return None
        except Exception as e:
            print(f"Ocorreu um erro ao salvar o usuário: {e}")
            return None
        finally:
            conn.close()

    @classmethod
    def get_user_by_name(cls, username):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return cls(user_id=row[0], username=row[1], password=row[2])
        return None
    
    def get_characters(self):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM characters WHERE user_id = ?', (self.id,))
        rows = cursor.fetchall()
        conn.close()

        characters_list = []

        for r in rows:
            char = Character(
                character_id=r[0],
                user_id=r[1],
                name=r[2],
                age=r[3],
                eye_color=r[4],
                skin_color=r[5],
                classe=r[6],
                height=r[7],
                physical=r[8],
                race=r[9],
                region=r[10],
                attribute_strength=r[11],
                attribute_agility=r[12],
                attribute_vitality=r[13],
                attribute_intelligence=r[14],
                attribute_survival=r[15],
                attribute_magic=r[16]
            )
            characters_list.append(char)
        return characters_list
    

    def get_mesas(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT m.id, m.name, m.description, um.is_mestre
            FROM mesas m
            JOIN user_mesas um ON m.id = um.mesa_id
            WHERE um.user_id = ?
        ''', (self.id,))
        rows = cursor.fetchall()
        conn.close()
        
        return [{"id": r[0], "name": r[1], "description": r[2], "is_mestre": bool(r[3])} for r in rows]