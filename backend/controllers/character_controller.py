from models.character import Character
from models.user import User

def register_character(name, age, eye_color, skin_color, classe, height, physical, race, region, attr_str, attr_agi, attr_vit, attr_int, attr_sur, attr_mag):
    user_id = st.session_state.get('user_id')
    if not user_id:
        return False, "Sessão expirada."
    
    new_character = Character(
        user_id=user_id,
        name=name,
        age=age,
        eye_color=eye_color,
        skin_color=skin_color,
        classe=classe,
        height=height,
        physical=physical,
        race=race,
        region=region,
        attribute_strength=attr_str,
        attribute_agility=attr_agi,
        attribute_vitality=attr_vit,
        attribute_intelligence=attr_int,
        attribute_survival=attr_sur,
        attribute_magic=attr_mag
    )

    success = new_character.save()

    if success:
        return True, f"A lenda de {name} começou! Personagem criado com sucesso."
    else:
        return False, "Erro ao forjar o personagem no banco de dados. Tente novamente."
    
def get_my_characters():
    username = st.session_state.get('username')
    if not username:
        return []
    
    current_user = User.get_user_by_name(username)

    if current_user:
        return current_user.get_characters()
    
    return []

def get_character_by_id(character_id):
    return Character.get_character_by_id(character_id)
    