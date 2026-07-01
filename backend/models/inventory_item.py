from database import get_connection

class InventoryItem:
    def __init__(self, character_id, mesa_item_id, quantity=1, is_equipped=0, id=None):
        self.id = id
        self.character_id = character_id
        self.mesa_item_id = mesa_item_id
        self.quantity = quantity
        self.is_equipped = is_equipped

    def save(self):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            if self.id is None:
                cursor.execute('''
                    INSERT INTO inventory (character_id, mesa_item_id, quantity, is_equipped) 
                    VALUES (?, ?, ?, ?)
                ''', (self.character_id, self.mesa_item_id, self.quantity, self.is_equipped))
                self.id = cursor.lastrowid
            else:
                cursor.execute('''
                    UPDATE inventory SET quantity=?, is_equipped=? WHERE id=?
                ''', (self.quantity, self.is_equipped, self.id))
            conn.commit()
            return True
        finally:
            conn.close()