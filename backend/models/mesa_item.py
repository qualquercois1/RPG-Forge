from database import get_connection

class MesaItem:
    def __init__(self, mesa_id, name, description="", item_type="Geral", weight=0.0, rarity="Comum", id=None):
        self.id = id
        self.mesa_id = mesa_id
        self.name = name
        self.description = description
        self.item_type = item_type
        self.weight = weight
        self.rarity = rarity

    def save(self):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            if self.id is None:
                cursor.execute('''
                    INSERT INTO mesa_items (mesa_id, name, description, item_type, weight, rarity) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (self.mesa_id, self.name, self.description, self.item_type, self.weight, self.rarity))
                self.id = cursor.lastrowid
            else:
                cursor.execute('''
                    UPDATE mesa_items SET name=?, description=?, item_type=?, weight=?, rarity=? 
                    WHERE id=?
                ''', (self.name, self.description, self.item_type, self.weight, self.rarity, self.id))
            conn.commit()
            return True
        except Exception as e:
            print(f"Erro ao salvar item da mesa: {e}")
            return False
        finally:
            conn.close()