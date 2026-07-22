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

def create_friendships_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS friendships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id_1 INTEGER NOT NULL,
            user_id_2 INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id_1) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id_2) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(user_id_1, user_id_2)
        )
    ''')
    conn.commit()
    conn.close()

def create_friend_requests_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS friend_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(sender_id, receiver_id)
        )
    ''')
    conn.commit()
    conn.close()

def create_table_invitations_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS table_invitations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (table_id) REFERENCES tables (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(table_id, user_id)
        )
    ''')
    conn.commit()
    conn.close()

def run_migrations():
    conn = get_connection()
    cursor = conn.cursor()

    # Characters table columns
    cursor.execute("PRAGMA table_info(characters)")
    cols = [row[1] for row in cursor.fetchall()]
    if 'image_url' not in cols:
        cursor.execute("ALTER TABLE characters ADD COLUMN image_url TEXT")
    if 'unallocated_points' not in cols:
        cursor.execute("ALTER TABLE characters ADD COLUMN unallocated_points INTEGER DEFAULT 0")

    # Inventory table columns
    cursor.execute("PRAGMA table_info(inventory)")
    cols = [row[1] for row in cursor.fetchall()]
    if 'image_url' not in cols:
        cursor.execute("ALTER TABLE inventory ADD COLUMN image_url TEXT")

    # Table items table columns
    cursor.execute("PRAGMA table_info(table_items)")
    cols = [row[1] for row in cursor.fetchall()]
    if 'image_url' not in cols:
        cursor.execute("ALTER TABLE table_items ADD COLUMN image_url TEXT")

    # Session logs table columns
    cursor.execute("PRAGMA table_info(session_logs)")
    cols = [row[1] for row in cursor.fetchall()]
    if 'event_type' not in cols:
        cursor.execute("ALTER TABLE session_logs ADD COLUMN event_type TEXT DEFAULT 'normal'")
    if 'item_data' not in cols:
        cursor.execute("ALTER TABLE session_logs ADD COLUMN item_data TEXT")

    conn.commit()
    conn.close()

def create_tables():
    create_users_table()
    create_tables_table()
    create_characters_table()
    create_inventory_table()
    create_sessions_table()
    create_table_items_table()
    create_friendships_table()
    create_friend_requests_table()
    create_table_invitations_table()
    run_migrations()