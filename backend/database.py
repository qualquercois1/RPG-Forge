import sqlite3

def get_connection():
    return sqlite3.connect('../rpg.db', check_same_thread=False)

def create_users_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def create_mesas_table():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mesas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_mesas (
            user_id INTEGER NOT NULL,
            mesa_id INTEGER NOT NULL,
            is_mestre INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, mesa_id),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (mesa_id) REFERENCES mesas (id) ON DELETE CASCADE
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mesa_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mesa_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            item_type TEXT DEFAULT 'Geral',
            weight REAL DEFAULT 0.0,
            rarity TEXT DEFAULT 'Comum',
            FOREIGN KEY (mesa_id) REFERENCES mesas (id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()

def create_characters_table():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            mesa_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            age INTEGER,
            eye_color TEXT,
            skin_color TEXT,
            classe TEXT,
            height REAL,
            physical TEXT,
            race TEXT,
            region TEXT,
            attribute_strength INTEGER,
            attribute_agility INTEGER,
            attribute_vitality INTEGER,
            attribute_intelligence INTEGER,
            attribute_survival INTEGER,
            attribute_magic INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (mesa_id) REFERENCES mesas (id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()

def create_inventory_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            mesa_item_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            is_equipped INTEGER DEFAULT 0,
            FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE,
            FOREIGN KEY (mesa_item_id) REFERENCES mesa_items (id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()

def create_tables():
    create_users_table()
    create_mesas_table()
    create_characters_table()
    create_inventory_table()