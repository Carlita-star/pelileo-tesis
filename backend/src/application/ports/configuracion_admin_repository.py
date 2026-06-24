from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class ConfiguracionAdminRepositoryPort(ABC):

    @abstractmethod
    def obtener_completo(self) -> Dict[str, Any]:
        ...

    @abstractmethod
    def obtener_para_portal(self) -> Dict[str, Any]:
        ...

    @abstractmethod
    def guardar_datos_gad(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        ...

    @abstractmethod
    def guardar_apariencia(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        ...

    @abstractmethod
    def guardar_redes(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        ...

    @abstractmethod
    def guardar_header_footer(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        ...

    @abstractmethod
    def guardar_menu(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        ...

    @abstractmethod
    def guardar_mapa(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        ...

    @abstractmethod
    def guardar_imagen(self, tipo: str, archivo, actor_id: int) -> Dict[str, Any]:
        ...
