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

def create_tables_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            game_master_id INTEGER NOT NULL,
            FOREIGN KEY (game_master_id) REFERENCES users (id) ON DELETE CASCADE
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
            table_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            classe TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            race TEXT,
            region TEXT,
            age INTEGER,
            height TEXT,
            physical TEXT,
            color TEXT,
            lore TEXT,
            str INTEGER DEFAULT 5,
            agi INTEGER DEFAULT 5,
            int INTEGER DEFAULT 5,
            vit INTEGER DEFAULT 5,
            sur INTEGER DEFAULT 5,
            mag INTEGER DEFAULT 5,
            alive INTEGER DEFAULT 1,
            hp INTEGER DEFAULT 50,
            max_hp INTEGER DEFAULT 50,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (table_id) REFERENCES tables (id) ON DELETE CASCADE
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
            item_name TEXT NOT NULL,
            description TEXT,
            weight REAL DEFAULT 0.0,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()

def create_sessions_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (table_id) REFERENCES tables (id) ON DELETE CASCADE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS session_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            user_id INTEGER,
            username TEXT,
            event_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
        )
    ''')
    conn.commit()
    conn.close()

def create_table_items_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS table_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id INTEGER NOT NULL,
            item_name TEXT NOT NULL,
            description TEXT,
            weight REAL DEFAULT 0.0,
            FOREIGN KEY (table_id) REFERENCES tables (id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()

def create_tables():
    create_users_table()
    create_tables_table()
    create_characters_table()
    create_inventory_table()
    create_sessions_table()
    create_table_items_table()