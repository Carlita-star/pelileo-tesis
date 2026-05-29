# =========================================================
# ARCHIVO:
# src/domain/usuarios/rules.py
# =========================================================

import re


class UsuarioRules:

    # =====================================================
    # VALIDAR EMAIL
    # =====================================================

    @staticmethod
    def validar_email_institucional(
        email
    ):

        if '@' not in email:
            raise ValueError(
                'Correo electrónico inválido.'
            )

    # =====================================================
    # VALIDAR USERNAME
    # =====================================================

    @staticmethod
    def validar_username(
        username
    ):

        if len(username) < 4:
            raise ValueError(
                'El username es demasiado corto.'
            )

        if ' ' in username:
            raise ValueError(
                'El username no puede contener espacios.'
            )

    # =====================================================
    # VALIDAR PASSWORD
    # =====================================================

    @staticmethod
    def validar_password(
        password
    ):

        if len(password) < 8:
            raise ValueError(
                'La contraseña debe tener mínimo 8 caracteres.'
            )

        if not re.search(r'[A-Z]', password):
            raise ValueError(
                'La contraseña debe contener mayúsculas.'
            )

        if not re.search(r'[a-z]', password):
            raise ValueError(
                'La contraseña debe contener minúsculas.'
            )

        if not re.search(r'[0-9]', password):
            raise ValueError(
                'La contraseña debe contener números.'
            )

    # =====================================================
    # VALIDAR BLOQUEO
    # =====================================================

    @staticmethod
    def validar_bloqueo_usuario(
        intentos
    ):

        if intentos >= 5:
            raise ValueError(
                'Usuario bloqueado por múltiples intentos.'
            )

    # =====================================================
    # VALIDAR NOMBRES
    # =====================================================

    @staticmethod
    def validar_nombre(
        nombre
    ):

        if len(nombre.strip()) < 2:
            raise ValueError(
                'Nombre inválido.'
            )

    # =====================================================
    # VALIDAR SUPERUSUARIO
    # =====================================================

    @staticmethod
    def validar_superusuario(
        is_staff,
        is_superuser
    ):

        if is_superuser and not is_staff:
            raise ValueError(
                'Un superusuario debe ser staff.'
            )