from database import get_connection

class Character:
    def __init__(self, user_id, mesa_id, name, age, eye_color, skin_color, classe, height, physical, race, region, attribute_strength, attribute_agility, attribute_vitality, attribute_intelligence,
                 attribute_survival, attribute_magic, character_id=None):
        self.id = character_id
        self.user_id = user_id
        self.mesa_id = mesa_id
        self.name = name
        self.age = age
        self.eye_color = eye_color
        self.skin_color = skin_color
        self.classe = classe
        self.height = height
        self.physical = physical
        self.race = race
        self.region = region
        self.attribute_strength = attribute_strength
        self.attribute_agility = attribute_agility
        self.attribute_vitality = attribute_vitality
        self.attribute_intelligence = attribute_intelligence
        self.attribute_survival = attribute_survival
        self.attribute_magic = attribute_magic

    def save(self):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                           INSERT INTO characters (
                            user_id,
                            mesa_id,
                            name,
                            age,
                            eye_color,
                            skin_color,
                            classe,
                            height,
                            physical,
                            race,
                            region,
                            attribute_strength,
                            attribute_agility,
                            attribute_vitality,
                            attribute_intelligence,
                            attribute_survival,
                            attribute_magic
                           ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )''', 
                           (self.user_id, self.name, self.age, self.eye_color, self.skin_color, self.classe, self.height, self.physical, self.race, self.region, self.attribute_strength, self.attribute_agility, self.attribute_vitality, self.attribute_intelligence, self.attribute_survival, self.attribute_magic))
            conn.commit()
            self.id = cursor.lastrowid
            return True
        except Exception as e:
            print(f"Ocorreu um erro ao salvar o personagem: {e}")
            return False
        finally:
            conn.close()

    @classmethod
    def get_character_by_id(cls, character_id):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM characters WHERE id = ?', (character_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return cls(
                character_id=row[0], user_id=row[1], mesa_id=row[2], name=row[3], age=row[4],
                eye_color=row[5], skin_color=row[6], classe=row[7], height=row[8],
                physical=row[9], race=row[10], region=row[11], attribute_strength=row[12],
                attribute_agility=row[13], attribute_vitality=row[14], attribute_intelligence=row[15],
                attribute_survival=row[16], attribute_magic=row[17]
            )
        return None
    
    def get_inventory_details(self):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT i.id, i.quantity, i.is_equipped, 
                   m.name, m.item_type, m.weight, m.rarity 
            FROM inventory i
            JOIN mesa_items m ON i.mesa_item_id = m.id
            WHERE i.character_id = ?
        ''', (self.id,))
        rows = cursor.fetchall()
        conn.close()
        
        return [{"inventory_id": r[0], "quantity": r[1], "is_equipped": r[2], "name": r[3], "type": r[4], "weight": r[5], "rarity": r[6]} for r in rows]
    
    def get_current_weight(self):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT SUM(m.weight * i.quantity) 
            FROM inventory i
            JOIN mesa_items m ON i.mesa_item_id = m.id
            WHERE i.character_id = ?
        ''', (self.id,))
        
        resultado = cursor.fetchone()[0]
        conn.close()
        return resultado if resultado else 0.0
    
    @property
    def max_capacity(self):
        return self.attribute_strength * 2.5
    