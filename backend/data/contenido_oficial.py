"""
Datos oficiales del documento CONTENIDO PAGINA WEB-PELILEO-ESPE-02.
Sin fotografías (se agregan después desde el admin).
"""

CONFIG_PORTAL = {
    'eslogan': 'Tradición, cultura, aventura y naturaleza',
    'descripcion': (
        'Portal turístico del cantón San Pedro de Pelileo. Tradición, cultura, '
        'aventura y naturaleza en el corazón de Tungurahua.'
    ),
    'credito_fotografico': 'Fotografías: Patricio Cisneros (cuando estén publicadas).',
}

# Categorías a asegurar (nombre exacto para filtros del directorio)
CATEGORIAS = [
    'Naturaleza',
    'Cultura',
    'Aventura',
    'Hospedaje',
    'Alimentación',
    'Complejos y balnearios',
    'Artesanías',
    'Guianza',
    'Manifestaciones Culturales',
]

PARROQUIAS = [
    'Pelileo',
    'Huambaló',
    'Salasaka',
    'Benítez',
    'Cotaló',
    'El Rosario',
    'García Moreno',
    'Bolívar',
]

# ---------------------------------------------------------------------------
# ATRACTIVOS NATURALES (geositios + sitios naturales permanentes)
# ---------------------------------------------------------------------------
ATRACTIVOS = [
    {
        'nombre': 'Geositio Macrodeslizamiento El Obraje de San Ildefonso',
        'categoria': 'Naturaleza',
        'parroquia': 'Pelileo',
        'direccion': 'El Obraje',
        'horario': 'Todos los días, las 24h00',
        'descripcion': (
            'El macrodeslizamiento El Obraje de San Ildefonso es un geositio del Geoparque '
            'UNESCO Volcán Tungurahua. Corresponde a un antiguo proceso de remoción en masa '
            'vinculado a eventos del siglo XVIII. Se desarrolla sobre depósitos volcánicos '
            'cuaternarios asociados al Volcán Cotopaxi y fallas como Pelileo–Pallatanga. '
            'Presenta valores: científico 5,88, didáctico 6,25 y turístico 7,00, destacando '
            'su importancia geológica e histórica-cultural.'
        ),
        'actividades': ['Caminata', 'Fotografía'],
        'destacado': True,
        'detalle': {'meses_recomendados': None, 'observaciones': 'Geositio UNESCO Volcán Tungurahua'},
    },
    {
        'nombre': 'Geositio Volcán Huisla (volcán extinto)',
        'categoria': 'Naturaleza',
        'parroquia': 'Pelileo',
        'direccion': 'Caserío Teligote (3763 m.s.n.m.)',
        'horario': 'Todos los días, las 24h00',
        'altitud': 3670,
        'descripcion': (
            'El Cerro Teligote es un geositio del Geoparque UNESCO Volcán Tungurahua con una '
            'altitud de 3.670 msnm. Su cima constituye un magnífico mirador que permite '
            'deleitarse de un paisaje impresionante de poblados que rodean la zona, así como '
            'de las principales elevaciones de la Sierra central del Ecuador. Además, las '
            'comunidades indígenas acuden a este lugar para hacer peticiones, oraciones y '
            'dejar ofrendas para la Pacha Mama.'
        ),
        'actividades': ['Caminata', 'Senderismo', 'Camping', 'Observación de flora', 'Observación de fauna', 'Fotografía'],
        'destacado': True,
        'detalle': {
            'meses_recomendados': 'Verano; en invierno llevar ropa impermeable y botas de caucho',
        },
    },
    {
        'nombre': 'Geositio Cerro Extinto Mul Mul',
        'categoria': 'Naturaleza',
        'parroquia': 'Huambaló',
        'direccion': 'Parroquia Huambaló (3600 m.s.n.m.)',
        'horario': 'Todos los días, las 24h00',
        'altitud': 3878,
        'descripcion': (
            'El Geositio volcán Mulmul es un centro volcánico extinto en Pelileo, a 3.878 m s.n.m. '
            'Es parte del Geoparque Volcán Tungurahua, declarado Geoparque Mundial el 11 de abril '
            'de 2025. Se formó por antiguas erupciones, influido por la falla de Pallatanga, tras '
            'el colapso del volcán Huisla (180.000 años) y erupción de Chalupas (215.000 años). '
            'Presenta depósitos andesíticos, erosión y es apto para senderismo, observación de '
            'flora, aves y turismo ecológico.'
        ),
        'actividades': ['Caminata', 'Senderismo', 'Camping', 'Observación de flora', 'Observación de fauna', 'Fotografía'],
        'destacado': True,
        'detalle': {
            'meses_recomendados': 'Verano; en invierno llevar ropa impermeable y botas de caucho',
        },
    },
    {
        'nombre': 'Geositio Cascada del Gorila',
        'categoria': 'Naturaleza',
        'parroquia': 'Pelileo',
        'direccion': 'Cuenca hidrográfica del Río Chambo – Chacauco',
        'horario': 'Todos los días, las 24h00',
        'descripcion': (
            'La Cascada del Gorila, en Pelileo, es un geositio del Geoparque UNESCO Volcán '
            'Tungurahua, con una caída de agua de aproximadamente 70 m formada sobre rocas '
            'volcánicas andesítico-basálticas en la cuenca del río Chambo. Su origen se '
            'relaciona con erosión hídrica y flujos de lava del Volcán Tungurahua, con eventos '
            'ocurridos entre 3000 años AP y la erupción de 1886. Presenta valores: científico '
            '5,13, didáctico 6,13 y turístico 7,38.'
        ),
        'actividades': ['Caminata', 'Fotografía'],
        'destacado': True,
    },
    {
        'nombre': 'Geositio Raíces Petrificadas Las Caras',
        'categoria': 'Naturaleza',
        'parroquia': 'Pelileo',
        'direccion': 'Sector Chacauco (cuenca del Río Chambo)',
        'horario': 'Todos los días, las 24h00',
        'descripcion': (
            'Raíces Petrificadas Las Caras es un geositio del Geoparque UNESCO Volcán Tungurahua: '
            'un yacimiento fósil formado por la petrificación de flora y fauna mediante '
            'precipitación de carbonato de calcio. Está asociado a materiales volcánicos '
            'Pisayambo y depósitos superficiales vinculados al volcán Mulmul. Presenta valores: '
            'científico 7, didáctico 7 y turístico 7,88, con susceptibilidad antrópica 1,50 y '
            'riesgo 0,66. Su origen se relaciona con procesos geotermales e hidrotermales.'
        ),
        'actividades': ['Caminata', 'Fotografía', 'Investigación'],
        'destacado': True,
    },
    {
        'nombre': 'Vertientes de Shushuri',
        'categoria': 'Naturaleza',
        'parroquia': 'Pelileo',
        'direccion': 'Barrio La Rabija, calle vía Chambiato',
        'descripcion': (
            'En estas vertientes cristalinas se puede disfrutar, relajarse y respirar aire puro '
            'por sus chorreras. El valle del Shushuri es un encanto natural impregnado de quindes '
            'y cangrejos de río; un lugar para el encuentro con la espiritualidad. En estas '
            'vertientes naturales libres de contaminación el visitante puede bañarse y realizar '
            'caminatas en familia o con amigos.'
        ),
        'actividades': ['Caminata', 'Baño en vertientes', 'Fotografía'],
        'destacado': False,
    },
    {
        'nombre': 'Laguna La Moya',
        'categoria': 'Naturaleza',
        'parroquia': 'Pelileo',
        'direccion': 'Pelileo Grande – vía Pelileo Baños',
        'descripcion': (
            'Encanto natural donde se mezcla la magia de la naturaleza con un ambiente puro. '
            'Posee una laguna nutrida por diferentes vertientes en la cual se puede realizar '
            'paseo en bote mientras se observa una gran cantidad de peces. En los alrededores '
            'se pueden realizar caminatas en familia o con amigos.'
        ),
        'actividades': ['Paseo en bote', 'Caminata', 'Fotografía'],
        'destacado': True,
    },
    {
        'nombre': 'Parapente Cerro Nitón',
        'categoria': 'Aventura',
        'parroquia': 'Pelileo',
        'direccion': 'Cerro Nitón, a 4 km de Pelileo – vía Pelileo-Nitón',
        'descripcion': (
            'Actividad de parapente en el Cerro Nitón, con condiciones atmosféricas adecuadas. '
            'Se pueden observar paisajes extraordinarios entre ellos los volcanes Altar, Cotopaxi, '
            'Tungurahua, Chimborazo, Ilinizas y otras elevaciones de la Sierra ecuatoriana.'
        ),
        'actividades': ['Parapente', 'Fotografía'],
        'destacado': True,
    },
    # Culturales permanentes (no fiestas)
    {
        'nombre': 'Empanadas de tiesto',
        'categoria': 'Cultura',
        'parroquia': 'Pelileo',
        'direccion': 'Barrio Oriente, Av. Confraternidad y Antonio Clavijo',
        'descripcion': (
            'Empanadas tradicionales de Pelileo. Las familias van de generación en generación '
            'elaborando este majar; en el pasado se hacían en casa con leña. Se preparan con '
            'harina de castilla, levadura y agua tibia; se rellenan de panela en polvo y se '
            'cuecen en el tiesto sin grasa.'
        ),
        'actividades': ['Gastronomía'],
    },
    {
        'nombre': 'Mercado República de Argentina',
        'categoria': 'Cultura',
        'parroquia': 'Pelileo',
        'direccion': 'Barrio Comercial, calle Quis Quis y Padre Jorge Chacón',
        'descripcion': (
            'Considerado el primer mercado moderno de Tungurahua. Oferta variedad de platos '
            'tradicionales con la sazón pelileña, además de secciones de carnes, frutas, '
            'abarrotes y legumbres. Cuenta con salón de eventos, plaza cívica y parqueadero '
            'con guardias de control.'
        ),
        'actividades': ['Compras', 'Gastronomía'],
    },
    {
        'nombre': 'Feria del Jeans (El Tambo)',
        'categoria': 'Cultura',
        'parroquia': 'Pelileo',
        'direccion': 'Barrio El Tambo, Av. Confraternidad y Av. Pedro Vicente Maldonado',
        'descripcion': (
            'Feria con diversos locales que ofrecen los reconocidos jeans confeccionados en '
            'modelos tradicionales y actuales, a precios accesibles. Conocida por su producción '
            'textil, seguridad, buen servicio y facilidad para recorrer la cadena comercial.'
        ),
        'actividades': ['Compras', 'Turismo comercial'],
        'destacado': True,
    },
    {
        'nombre': 'Centro Artesanal Huambaló – Feria Permanente del Mueble',
        'categoria': 'Cultura',
        'parroquia': 'Huambaló',
        'direccion': 'Juan Montalvo y Arturo Freire, Huambaló',
        'descripcion': (
            'Centro artesanal de Huambaló con feria permanente del mueble: comercialización de '
            'muebles en madera (sala, comedor, dormitorios, oficina, closet) y parqueadero.'
        ),
        'actividades': ['Artesanías', 'Compras'],
    },
    {
        'nombre': 'Feria de la mata a la olla',
        'categoria': 'Cultura',
        'parroquia': 'Pelileo',
        'direccion': 'Barrio comercial, calle Vicente Rocafuerte y calle 12 de Noviembre',
        'horario': 'Jueves desde las 07:00',
        'descripcion': (
            'Feria de biogranjas «De la mata a la olla» los jueves desde las 07:00. Se expenden '
            'productos sanos y de calidad a precios asequibles: hortalizas y legumbres orgánicas, '
            'cuyes y conejos de campo faenados por propietarios con certificados de calidad.'
        ),
        'actividades': ['Compras', 'Gastronomía'],
    },
]

# ---------------------------------------------------------------------------
# EVENTOS / FIESTAS (calendario cultural)
# ---------------------------------------------------------------------------
EVENTOS = [
    {
        'nombre': 'Fiesta de los Caporales',
        'categoria': 'Manifestaciones Culturales',
        'direccion': 'Parroquia Salasaka',
        'organizador': 'Comunidad Salasaka',
        'fecha_inicio': '2027-02-03T19:00:00+00:00',
        'fecha_fin': '2027-02-05T19:00:00+00:00',
        'latitud': -1.3088,
        'longitud': -78.5110,
        'descripcion': (
            'La fiesta de los Caporales se realiza cada febrero y recuerda la lucha contra la '
            'opresión española y los ultrajes a los pueblos milenarios de América. Participan '
            'personajes como Caporal, Ñuñu, Negros, Doñas y los Montados; además de la banda de '
            'pueblo, músicos tradicionales de Salasaka y el bocinero. Se comparte música y comida '
            'para mantener la tradición de la cultura Salasaca.'
        ),
    },
    {
        'nombre': 'Fiesta del Inti Raymi',
        'categoria': 'Manifestaciones Culturales',
        'direccion': 'Parroquia Salasaka',
        'organizador': 'Comunidad Salasaka',
        'fecha_inicio': '2027-06-20T19:00:00+00:00',
        'fecha_fin': '2027-06-21T18:00:00+00:00',
        'latitud': -1.3095,
        'longitud': -78.5122,
        'descripcion': (
            'La Fiesta del Inti Raymi o solsticio de verano se celebra el 21 de junio en honor a '
            'Pacha Kamac, Pacha Mama y Taita Inti, para pedirle al Sol que se acerque a la Tierra '
            'e inicie el verano. Tambores, flauta y guitarra se escuchan en las calles; los '
            'habitantes visten sus mejores galas, preparan comida, chicha, danzantes y músicos '
            'para dar gracias por las cosechas.'
        ),
    },
    {
        'nombre': 'Fiesta de los Capitanes',
        'categoria': 'Manifestaciones Culturales',
        'direccion': 'Parroquia Salasaka – Comunidad Chilcapamba',
        'organizador': 'Comunidad Salasaka',
        'fecha_inicio': '2026-12-20T19:00:00+00:00',
        'fecha_fin': '2026-12-21T18:00:00+00:00',
        'latitud': -1.3110,
        'longitud': -78.5095,
        'descripcion': (
            'Fiesta anual en diciembre que recuerda la Conquista Española en América y la '
            'participación de los Salasacas en la Revolución Liberal de Eloy Alfaro. Los soldados '
            'representan la Batalla de la Conquista; recorren la casa de los priostes con el Loero '
            '(coplas), traje blanco, alas y aureola. Los músicos entonan sanjuanitos.'
        ),
    },
    {
        'nombre': 'Festival Pluricultural Tzawar Mishki',
        'categoria': 'Manifestaciones Culturales',
        'direccion': 'Parroquia Salasaka – Salasaka Centro',
        'organizador': 'GAD Salasaca',
        'fecha_inicio': '2026-11-01T14:00:00+00:00',
        'fecha_fin': '2026-11-02T13:00:00+00:00',
        'latitud': -1.3075,
        'longitud': -78.5135,
        'descripcion': (
            'El tzawar mishki (penco dulce) es la bebida ancestral del pueblo Salasaca que se '
            'extrae de la cabuya/penco. El festival rescata esta bebida con música, danza, '
            'artesanías y gastronomía.'
        ),
    },
]

# ---------------------------------------------------------------------------
# EMPRENDIMIENTOS / DIRECTORIO
# ---------------------------------------------------------------------------
EMPRENDIMIENTOS = [
    # --- Hospedaje ---
    {
        'nombre': 'Hostal San Pedro',
        'categoria': 'Hospedaje',
        'parroquia': 'Pelileo',
        'telefono': '0986812647',
        'email': 'sanpedrohostal@yahoo.com',
        'direccion': 'Vicente Rocafuerte y Antonio Clavijo',
        'horario': 'Lunes a domingo, las 24h00',
        'descripcion': (
            'Hospedaje con habitaciones individuales, dobles, triples y matrimoniales con baño '
            'privado, TV cable, WiFi y garaje. Propietario: Cesar Morales.'
        ),
    },
    {
        'nombre': 'Hotel Azul',
        'categoria': 'Hospedaje',
        'parroquia': 'Pelileo',
        'telefono': '0967467630',
        'email': 'mirianng826@gmail.com',
        'direccion': 'Av. Confraternidad, Barrio El Tambo',
        'horario': 'Todos los días, las 24h00',
        'descripcion': (
            'Hospedaje en habitaciones individuales, dobles, triples, matrimoniales y desayunos. '
            'Propietaria: Myriam Gómez.'
        ),
    },
    {
        'nombre': 'Parque Japonés Luna Bonsai',
        'categoria': 'Complejos y balnearios',
        'parroquia': 'Pelileo',
        'telefono': '0999822824',
        'sitio_web': 'https://www.lunabonsai.com',
        'direccion': 'Pelileo km 18 vía Ambato-Baños (Yatakí – Valle Hermoso)',
        'horario': 'Lunes a domingo: 09:00 – 18:00',
        'descripcion': (
            'Un pedacito de Japón en Yatakí – Valle Hermoso. Bonsái más antiguo de Ecuador, '
            'pagodas, Buda, Torii y aves; cafetería panorámica con café, té, chocolate, humitas '
            'y sándwiches; 4 columpios para fotografías. Propietario: Miguel Roberto Luna Fiallos.'
        ),
        'destacado': True,
    },
    {
        'nombre': 'Edificio R & M',
        'categoria': 'Hospedaje',
        'parroquia': 'Pelileo',
        'telefono': '0997894879',
        'email': 'rugelfabricio66@gmail.com',
        'direccion': 'Nardor Gardenias y Paraíso',
        'horario': 'Lunes a domingo, las 24 horas',
        'descripcion': 'Hospedaje en habitaciones dobles y suites. Propietaria: Sandra Isabel Rugel Malusin.',
    },
    {
        'nombre': 'El Mirador (hospedaje Salasaka)',
        'categoria': 'Hospedaje',
        'parroquia': 'Salasaka',
        'telefono': '0990705757',
        'email': 'lluyaysvictor@hotmail.com',
        'direccion': 'Parroquia Salasaka, junto Minimarket Randy Pay',
        'horario': 'Lunes a domingo, las 24 horas',
        'descripcion': 'Hospedaje en habitaciones dobles. Propietario: Víctor Lorenzo Chiliquinga Masaquiza.',
    },
    # --- Alimentación (principales) ---
    {
        'nombre': 'Super Pollo',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0998769585',
        'email': 'marcovll2022@gmail.com',
        'direccion': 'Av. Confraternidad, Eloy Alfaro S/N',
        'horario': 'Lunes a domingo, las 24 horas',
        'descripcion': 'Comida rápida. Propietario: Llerena Martínez Marco Vinicio.',
    },
    {
        'nombre': 'Montana Café',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0992812704',
        'email': 'jonnathanjavier2@gmail.com',
        'direccion': 'Av. Confraternidad y Calicuchima, frente a la plaza 10 de agosto',
        'horario': 'Lunes a sábado de 16h00 a 22h00',
        'descripcion': 'Hamburguesas, alitas BBQ, sándwiches, platos a la carta y bebidas. Propietario: Jonnathan Montaguano.',
    },
    {
        'nombre': 'Rico Pollo – Antonio Clavijo',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0998333608',
        'email': 'carmipro80@gmail.com',
        'direccion': 'Barrio comercial – Antonio Clavijo y José Mejía',
        'horario': 'Lunes a domingo de 10h30 a 23h00',
        'descripcion': 'Restaurante, pollo broster, papas y bebidas. Propietaria: Carmen del Pilar Proaño Boada.',
    },
    {
        'nombre': 'Rico Pollo – Padre Jorge Chacón',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0995807375',
        'email': 'carmitapro@outlook.com',
        'direccion': 'Av. Confraternidad y Av. Padre Jorge Chacón S/N',
        'horario': 'Lunes a domingo de 10h30 a 22h00',
        'descripcion': 'Restaurante, pollo broster, papas y bebidas. Propietario: Proaño Boada David Eduardo.',
    },
    {
        'nombre': 'Rico Pollo – Parque Héroes de Paquilla',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0998333608',
        'email': 'anipro72@hotmail.com',
        'direccion': 'Av. Confraternidad, frente al parque Héroes de Paquilla',
        'horario': 'Lunes a domingo de 12h30 a 23h00',
        'descripcion': 'Restaurante, pollo broster, papas y bebidas. Propietaria: Proaño Boada Ana Cristina.',
    },
    {
        'nombre': 'MM Wings',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0989392110',
        'email': 'pelileo@mmwings.com',
        'direccion': 'Av. Confraternidad',
        'horario': 'Lunes a domingo de 14h00 a 22h00',
        'descripcion': 'Pizza, alitas, papas, platos a la carta y bebidas. Propietaria: Diana Jiménez.',
    },
    {
        'nombre': 'Balcón del Río',
        'categoria': 'Complejos y balnearios',
        'parroquia': 'Pelileo',
        'telefono': '0983780223',
        'email': 'nelson.timbilac@gmail.com',
        'direccion': 'La Clementina – La Playa',
        'horario': 'Viernes a domingo de 12h00 a 21h00 (gastronomía todos los días)',
        'descripcion': (
            'Restaurante, pesca deportiva, caminatas, viveros, catering, glamping, áreas verdes '
            'y garaje. Acceso preferible en vehículo liviano (vía de segundo orden). '
            'Propietaria: Sonia Guato.'
        ),
        'destacado': True,
    },
    {
        'nombre': 'Turismo Restaurant Los Auténticos Cuyes de Pelileo',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0986285402',
        'email': 'juanramoscastro1987@gmail.com',
        'direccion': 'Calicuchima y Antonio Clavijo S/N',
        'horario': 'Todos los días',
        'descripcion': 'Cuyes, conejos asados, caldos de gallina, eventos. Propietaria: Ramos Castro Sandra Jacqueline.',
    },
    {
        'nombre': 'Pollo El Ranchero',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0987065378',
        'email': 'jaimelopez.edu@gmail.com',
        'direccion': 'Av. Padre Jorge Chacón y Pedro Vicente Maldonado',
        'horario': 'Todos los días de 19h00 a 22h00',
        'descripcion': 'Pollo broster, papas y bebidas. Propietario: Jaime López Rocha.',
    },
    {
        'nombre': 'Cevichería Manabita El Arrecife',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0985265474',
        'email': 'cabezatito8@gmail.com',
        'direccion': 'Calle Quis Quis y Ricaurte',
        'horario': 'Todos los días de 08h00 a 15h00',
        'descripcion': 'Ceviches, encebollados, guatitas, banderas y mariscos. Propietario: Cabeza Párraga Tito Aníbal.',
    },
    {
        'nombre': 'El Cauca Restaurante',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0984450247',
        'email': 'gabi24071@hotmail.com',
        'direccion': 'Av. Celiano Monge',
        'horario': 'Lunes a sábado de 10h00 a 15h00',
        'descripcion': 'Comidas típicas. Propietaria: Gabriela Sánchez.',
    },
    {
        'nombre': 'Hornados Carmita',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0983953094',
        'direccion': 'Av. Reinaldo Miño y Juan de Velasco',
        'horario': 'Lunes a domingo de 08h00 a 16h00',
        'descripcion': 'Hornado, tortillas, picante, morcilla y bebidas. Propietaria: Carmen Ramos.',
    },
    {
        'nombre': 'Gastronomía Mercado República de Argentina',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'direccion': 'Av. Padre Chacón y Antonio Clavijo',
        'horario': 'Todos los días de 07h00 a 19h00',
        'descripcion': (
            'Hornado, llapingachos, yaguar locro, caldos de gallina, chochos, mote y platos '
            'típicos del cantón; jugos, batidos, frutas, legumbres y hortalizas.'
        ),
    },
    {
        'nombre': 'Paradero El Rincón del Cuy',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0979419253',
        'email': 'magus_1975@hotmail.com',
        'direccion': 'Parroquia Benítez, calle Velasco Ibarra',
        'horario': 'Todos los días',
        'descripcion': 'Cuy asado, conejo asado, pollo asado, chuleta, caldo de gallina, caldo de pata, jugos naturales. Propietaria: Macda López Coca.',
    },
    {
        'nombre': 'Paradero El Monito',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0967817569',
        'direccion': 'Barrio San Blas',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: Jessica Alexandra Morales.',
    },
    {
        'nombre': 'Paradero La Y',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0980646462',
        'direccion': 'Barrio San Blas',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: María de los Ángeles Cruz Sánchez.',
    },
    {
        'nombre': 'Paradero Solo Dios es Dueño',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0989993787',
        'direccion': 'Calle Velasco Ibarra',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: Anderson Ruiz.',
    },
    {
        'nombre': 'Restaurante Asandero de King',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0980338499',
        'direccion': 'Calle Velasco Ibarra y Juan Montalvo',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: Vinicio Barros.',
    },
    {
        'nombre': 'La Hueca del Sabor El Cangrejal',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0958895837',
        'direccion': 'Av. Velasco Ibarra',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: Cristian Paladines.',
    },
    {
        'nombre': 'Paradero Chamana',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0999811034',
        'direccion': 'Av. Velasco Ibarra y Juan Montalvo',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: Cristian Zurita.',
    },
    {
        'nombre': 'La Patateña',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0992861562',
        'direccion': 'Av. Velasco Ibarra',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: Miriam Coca.',
    },
    {
        'nombre': 'Súper Cuy de Campo',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0994957142',
        'direccion': 'Av. Velasco Ibarra',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: Nardella Marilu Zúñiga Jinez.',
    },
    {
        'nombre': 'Los Cuyes Mi Esperanza',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0997787881',
        'direccion': 'Av. Velasco Ibarra',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: Jefferson Andrés Cruz Coca.',
    },
    {
        'nombre': 'Casa Mía Garden House',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0995938375',
        'direccion': 'Av. Velasco Ibarra',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: Valeria Alvarado.',
    },
    {
        'nombre': 'Paradero María Elena',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0987420401',
        'direccion': 'Av. Velasco Ibarra',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: Estefanía Barreno.',
    },
    {
        'nombre': 'Pantufladas',
        'categoria': 'Alimentación',
        'parroquia': 'Benítez',
        'telefono': '0988321677',
        'direccion': 'Barrio San Blas',
        'horario': 'Todos los días',
        'descripcion': 'Comida típica (cuyes y conejos). Contacto: Daniel Guamani – Amanda Núñez.',
    },
    {
        'nombre': 'Subterráneo Buffet',
        'categoria': 'Alimentación',
        'parroquia': 'Pelileo',
        'telefono': '0992716079',
        'email': 'mariaelenap1976@gmail.com',
        'direccion': 'Calle Juan Montalvo y González Suárez',
        'horario': 'Sábados, domingos y feriados de 11h00 a 17h00',
        'descripcion': (
            'Buffet de comida típica serrana, desayunos tradicionales, catering, eventos, platos '
            'fuertes, guarniciones y postres. Entre semana con reserva. Propietaria: María Elena Paredes.'
        ),
    },
    {
        'nombre': 'Vulcanortop Bar Restaurante',
        'categoria': 'Alimentación',
        'parroquia': 'Cotaló',
        'telefono': '0992826323',
        'email': 'vulcanortop@gmail.com',
        'direccion': 'Parroquia Cotaló – Sector La Cruz',
        'horario': 'Martes a viernes 09h00–18h00; sábados y domingos 09h00–20h00',
        'descripcion': 'Cafetería, bar restaurant, cócteles, tortas y helados. Propietaria: Mayra Guevara.',
    },
    {
        'nombre': 'Restaurante Fannycita',
        'categoria': 'Alimentación',
        'parroquia': 'Salasaka',
        'telefono': '0988026755',
        'email': 'restaurantefannycita@gmail.com',
        'direccion': 'Vía a Baños, centro de Salasaka',
        'horario': 'Todos los días de 08h00 a 15h00',
        'descripcion': 'Desayunos, almuerzos, cuy, conejo y pollo asado. Propietaria: Fanny Chicaiza Pilco Sailema.',
    },
    {
        'nombre': 'Lo Típico de Mi Tierra',
        'categoria': 'Alimentación',
        'parroquia': 'García Moreno',
        'telefono': '0998807285',
        'email': 'mirysilva@hotmail.com',
        'direccion': 'García Moreno – Los Sauces, Los Capulíes S/N',
        'horario': 'Jueves a domingo de 10h00 a 18h00',
        'descripcion': 'Fritada, chicharrón, caldo de gallina, enborrajados, pescado frito, jugos y bebidas. Propietaria: Myrian Silva Vargas.',
    },
    # --- Complejos / balnearios ---
    {
        'nombre': 'Manka San Juan',
        'categoria': 'Complejos y balnearios',
        'parroquia': 'Pelileo',
        'telefono': '0986385404',
        'email': 'mankasanjuan@gmail.com',
        'direccion': 'Km 7.5 vía Pelileo – Patate',
        'horario': 'Viernes a domingo de 10h00 a 18h00',
        'descripcion': 'Restaurante, bar cafetería, áreas húmedas, sendero, pesca deportiva, garaje. Propietario: Marcelino Guachambala Cando.',
    },
    {
        'nombre': 'Complejo Turístico Don Moro',
        'categoria': 'Complejos y balnearios',
        'parroquia': 'Pelileo',
        'telefono': '0986072866',
        'email': 'moromontaguano@yahoo.com',
        'direccion': 'Caserío Artesón – Valle Hermoso – Chacauco',
        'horario': 'Jueves a domingo de 08h00 a 18h00',
        'descripcion': (
            'Restaurante, áreas verdes, áreas húmedas, piscina, áreas deportivas, descanso y '
            'garaje. Ingreso áreas húmedas: adultos $3, niños $1.50. Propietario: José Montaguano.'
        ),
    },
    {
        'nombre': "Complejo Turístico El Truchón D'Luigi",
        'categoria': 'Complejos y balnearios',
        'parroquia': 'Pelileo',
        'telefono': '0984536830',
        'email': 'complejo.eltruchon@gmail.com',
        'direccion': 'Valle Hermoso – Los Sauces',
        'horario': 'Lunes a viernes 09h00–17h00; sábado y domingo 09h00–19h00',
        'descripcion': 'Restaurante con derivados de la trucha, caldos de gallina, áreas verdes, salón de eventos y garaje. Propietario: Bolívar Paredes.',
    },
    {
        'nombre': 'Granja Piscícola San Vicente',
        'categoria': 'Complejos y balnearios',
        'parroquia': 'Pelileo',
        'telefono': '0999266400',
        'direccion': 'Valle Hermoso – Caserío Artesón – San Catalina',
        'horario': 'Todos los días',
        'descripcion': 'Gastronomía típica, caminatas, fotografía, pesca deportiva. Propietario: Liborio Curipallo.',
    },
    {
        'nombre': "Amy's Complejo Turístico",
        'categoria': 'Complejos y balnearios',
        'parroquia': 'Benítez',
        'telefono': '0985152388',
        'email': 'dysaul@hotmail.com',
        'direccion': 'Calle Juan Montalvo – Parroquia Benítez',
        'horario': 'Viernes 17h00–22h00; sábados 10h00–22h00; domingos 10h00–19h00',
        'descripcion': 'Piscina, sauna, turco, áreas verdes, juegos infantiles, restaurante y garage. Propietario: Dylon Pérez.',
    },
    {
        'nombre': 'Complejo Turístico Las Caras',
        'categoria': 'Complejos y balnearios',
        'parroquia': 'Cotaló',
        'telefono': '0981593579',
        'email': 'elsantuariodelodesconocido@gmail.com',
        'direccion': 'Cotaló – Chacauco',
        'horario': 'Lunes a viernes 08h00–18h00; sábados y domingos 08h00–20h00',
        'descripcion': (
            'Senderismo, piscinas termales, juegos extremos, restaurante, áreas de fotografía, '
            'miradores y estacionamiento. Ingreso: adultos $5, niños $2.50, tercera edad $3. '
            'Propietario: Manuel Rosero.'
        ),
        'destacado': True,
    },
    # --- Artesanías ---
    {
        'nombre': 'Centro Artesanal de Huambaló',
        'categoria': 'Artesanías',
        'parroquia': 'Huambaló',
        'telefono': '0997170267',
        'email': 'cenarhu@hotmail.com',
        'direccion': 'Calle Arturo Freire y Juan Montalvo',
        'horario': 'Lunes a domingo de 09h00 a 18h00',
        'descripcion': 'Venta de muebles en madera: sala, comedor, dormitorios, oficina, closet. Parqueadero. Propietario: Marco Paredes.',
    },
    {
        'nombre': 'Feria Artesanal Salasaka',
        'categoria': 'Artesanías',
        'parroquia': 'Salasaka',
        'telefono': '0990517169',
        'email': 'arturomarianojerezmasaquiza@gmail.com',
        'direccion': 'Salasaka',
        'horario': 'Todos los días de 09h00 a 19h00',
        'descripcion': 'Tapices, shigras, ponchos de lana, fajas, blusas, collares y artesanías. Propietario: Mariano Arturo Jerez Masaquiza.',
    },
    {
        'nombre': 'NASH Moda con Identidad Cultural (NASH Blusas)',
        'categoria': 'Artesanías',
        'parroquia': 'Salasaka',
        'telefono': '0969659213',
        'email': 'fannymsqza@gmail.com',
        'direccion': 'Salasaka',
        'horario': 'Todos los días de 08h00 a 19h00',
        'descripcion': 'Blusas indígenas bordadas a mano, manillas, bayetas, collares. Propietaria: Fanny Masaquiza Sailema.',
    },
    {
        'nombre': 'Ñawka Artesanías',
        'categoria': 'Artesanías',
        'parroquia': 'El Rosario',
        'telefono': '099482171',
        'email': 'heribertochango2020@gmail.com',
        'direccion': 'Salasaka, parroquia Rosario',
        'horario': 'Todos los días de 10h00 a 19h00',
        'descripcion': 'Shigras y zapatos en fibras naturales (cabuya y hojas). Propietario: Heriberto Chango Chango.',
    },
    {
        'nombre': 'LUISXIM Artesanías',
        'categoria': 'Artesanías',
        'parroquia': 'Benítez',
        'telefono': '099540855',
        'direccion': 'Barrio San Blas',
        'descripcion': 'Artesanías. Contacto: Luis Patricio Chicaiza.',
    },
    # --- Guías ---
    {
        'nombre': 'Alexandra Elizabeth Jarrín Tibanquiza – Guía Nacional',
        'categoria': 'Guianza',
        'parroquia': 'Pelileo',
        'telefono': '0998346459',
        'email': 'aelizaj17@gmail.com',
        'descripcion': 'Guía Nacional de Turismo.',
    },
    {
        'nombre': 'Anthony Joel Ramos Moreno – Guía Nacional',
        'categoria': 'Guianza',
        'parroquia': 'Pelileo',
        'telefono': '0986868326',
        'descripcion': 'Guía Nacional de Turismo.',
    },
    {
        'nombre': 'Patricio Cisneros – Guía Nacional',
        'categoria': 'Guianza',
        'parroquia': 'Pelileo',
        'telefono': '0992665488',
        'descripcion': 'Guía Nacional de Turismo. Fotógrafo colaborador del portal turístico.',
    },
    {
        'nombre': 'Edgar Paúl Soria Cordones – Guía de Aventura',
        'categoria': 'Guianza',
        'parroquia': 'Pelileo',
        'telefono': '0988030968',
        'descripcion': 'Guía de Turismo de Aventura / Guía de Turismo Nacional.',
    },
]
