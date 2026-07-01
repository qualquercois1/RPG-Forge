from database import get_connection

class Mesa:
    def __init__(self, name, description="", id=None):
        self.id = id
        self.name = name
        self.description = description

    def save(self):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            if self.id is None:
                cursor.execute('INSERT INTO mesas (name, description) VALUES (?, ?)', 
                               (self.name, self.description))
                self.id = cursor.lastrowid
            else:
                cursor.execute('UPDATE mesas SET name = ?, description = ? WHERE id = ?', 
                               (self.name, self.description, self.id))
            conn.commit()
            return True
        except Exception as e:
            print(f"Erro ao salvar mesa: {e}")
            return False
        finally:
            conn.close()

    def add_user(self, user_id, is_mestre=0):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO user_mesas (user_id, mesa_id, is_mestre) 
                VALUES (?, ?, ?)
            ''', (user_id, self.id, is_mestre))
            conn.commit()
            return True
        except Exception as e:
            print(f"Erro ao vincular usuário à mesa: {e}")
            return False
        finally:
            conn.close()