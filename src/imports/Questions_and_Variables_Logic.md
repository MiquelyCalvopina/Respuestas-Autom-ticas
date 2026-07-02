# Pregunta-AHORA

|  |  |  |  |  |  |  |
|---|---|---|---|---|---|---|
| Estas condiciones serán las vigentes hasta poder realizar el ajuste de diferenciación entre respuesta completa y respuesta vacía que HOY front NO manda al back para guardar el registro en answers.data |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
| CONDICIONALES PREGUNTA |  |  |  |  |  |  |
| TIPO |  |  | CONDICIÓN | APLICACIÓN |  |  |
| NPS / CES / CLI / CSAT | Nota |  | Es igual a | Select múltiple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo"). LAS OPCIONES FUNCIONAN A MANERA DE "OR": NPS es igual a 8 OR 2. |  |  |
|  |  |  | No es igual a | Select múltiple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo"). LAS OPCIONES FUNCIONAN A MANERA DE "OR": NPS no es igual a 8 OR 2. |  |  |
|  |  |  | Es mayor que | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Es mayor o igual a | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Es menor que | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Es menor o igual a | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Esta entre | Dos selects simples para rangos con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10). APLICA SOLO PARA ESCALAS NUMÉRICAS, NO DE TEXTO. SE DEBE VALIDAR QUE EL PRIMER VALOR SEA MENOR O IGUAL AL SEGUNDO Y EL SEGUNDO DEBE SER MAYOR O IGUAL AL PRIMERO. |  |  |
|  | Grupo |  | Es igual a | Select múltiple con los grupos definidos para el indicador en Set up (Ejm: "Promotor", "Neutro" y "Detractor"). LAS OPCIONES FUNCIONAN A MANERA DE "OR": NPS es igual a Detractor OR Neutro. |  |  |
|  |  |  | No es igual a | Select múltiple con los grupos definidos para el indicador en Set up (Ejm: "Promotor", "Neutro" y "Detractor"). LAS OPCIONES FUNCIONAN A MANERA DE "OR": NPS no es igual a Detractor OR Neutro. |  |  |
|  | No está vacía |  |  |  |  |  |
| Matriz de escalas | Select simple de atributos/filas | Nota | Es igual a | Select múltiple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo"). LAS OPCIONES FUNCIONAN A MANERA DE "OR": NPS es igual a 8 OR 2. |  |  |
|  |  |  | No es igual a | Select múltiple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo"). LAS OPCIONES FUNCIONAN A MANERA DE "OR": NPS no es igual a 8 OR 2. |  |  |
|  |  |  | Es mayor que | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Es mayor o igual a | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Es menor que | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Es menor o igual a | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Esta entre | Dos selects simples para rangos con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10). APLICA SOLO PARA ESCALAS NUMÉRICAS, NO DE TEXTO. SE DEBE VALIDAR QUE EL PRIMER VALOR SEA MENOR O IGUAL AL SEGUNDO Y EL SEGUNDO DEBE SER MAYOR O IGUAL AL PRIMERO. |  |  |
|  |  | Grupo | Es igual a | Select múltiple con los grupos definidos para el indicador en Set up (Ejm: "Promotor", "Neutro" y "Detractor"). LAS OPCIONES FUNCIONAN A MANERA DE "OR": NPS es igual a Detractor OR Neutro. |  |  |
|  |  |  | No es igual a | Select múltiple con los grupos definidos para el indicador en Set up (Ejm: "Promotor", "Neutro" y "Detractor"). LAS OPCIONES FUNCIONAN A MANERA DE "OR": NPS no es igual a Detractor OR Neutro. |  |  |
|  |  | No está vacía |  |  |  |  |
| Respuesta abierta |  |  | Contiene | Text input |  |  |
|  |  |  | No contiene | Text input |  |  |
|  |  |  | Está en la lista | Tag input. Si hay más de una opción ingresada, se las debe tratar como subcondiciones con el conector OR |  |  |
|  |  |  | No está en la lista | Tag input. Si hay más de una opción ingresada, se las debe tratar como subcondiciones con el conector OR |  |  |
|  |  |  | Es igual a | Text input |  |  |
|  |  |  | No es igual a | Text input |  |  |
|  |  |  | Habla de | Un select con buscador incluído que trae todas las etiquetas (N1>N2>N3) de los modelos que están activos en el estudio. Esta propiedad aparece solo si esta pregunta tiene activa la funcionalidad de categorizar respuesta |  |  |
|  |  |  | No habla de | Un select con buscador incluído que trae todas las etiquetas (N1>N2>N3) de los modelos que están activos en el estudio. Esta propiedad aparece solo si esta pregunta tiene activa la funcionalidad de categorizar respuesta |  |  |
|  |  |  | No está vacía |  |  |  |
| Formulario | Select simple de atributos/filas | Campo tipo Texto | Contiene | Text input |  |  |
|  |  |  | No contiene | Text input |  |  |
|  |  |  | Está en la lista | Tag input. Si hay más de una opción ingresada, se las debe tratar como subcondiciones con el conector OR |  |  |
|  |  |  | No está en la lista | Tag input. Si hay más de una opción ingresada, se las debe tratar como subcondiciones con el conector OR |  |  |
|  |  |  | Es igual a | Text input |  |  |
|  |  |  | No es igual a | Text input |  |  |
|  |  |  | No está vacía |  |  |  |
|  |  | Campo tipo Número | Es igual a | Number input |  |  |
|  |  |  | No es igual a | Number input |  |  |
|  |  |  | Es mayor que | Number input |  |  |
|  |  |  | Es mayor o igual a | Number input |  |  |
|  |  |  | Es menor que | Number input |  |  |
|  |  |  | Es menor o igual a | Number input |  |  |
|  |  |  | Esta entre | Dos Number Inputs para rangos. SE DEBE VALIDAR QUE EL PRIMER VALOR SEA MENOR O IGUAL AL SEGUNDO Y EL SEGUNDO DEBE SER MAYOR O IGUAL AL PRIMERO. |  |  |
|  |  |  | No está vacía |  |  |  |
|  |  | Campo tipo Correo Electrónico | Contiene | Text input |  |  |
|  |  |  | No contiene | Text input |  | Contiene |
|  |  |  | Pertenece a los dominios | Tag input. Si hay más de una opción ingresada, se las debe tratar como subcondiciones con el conector OR |  |  |
|  |  |  | No pertenece a los dominios | Tag input. Si hay más de una opción ingresada, se las debe tratar como subcondiciones con el conector OR |  |  |
|  |  |  | Es igual a | Text input |  | No contiene |
|  |  |  | No es igual a | Text input |  |  |
|  |  |  | No está vacía |  |  | Pertenece a los dominios |
|  |  | Campo Fecha (Solo date o dateTime) | Es igual a | Date picker con tiempo (dd-mm-aaaa HH:mm:ss) para dateTime y solo con fecha para date. |  | No pertenece a los dominios |
|  |  |  | No es igual a | Date picker con tiempo (dd-mm-aaaa HH:mm:ss) para dateTime y solo con fecha para date. |  | Es igual a |
|  |  |  | Es después de | Date picker con tiempo (dd-mm-aaaa HH:mm:ss) para dateTime y solo con fecha para date. |  | No es igual a |
|  |  |  | Es antes de | Date picker con tiempo (dd-mm-aaaa HH:mm:ss) para dateTime y solo con fecha para date. |  |  |
|  |  |  | Está entre | Dos date pickers para rangos. Cada date picker con tiempo (dd-mm-aaaa HH:mm:ss) para dateTime y solo con fecha para date. SE DEBE VALIDAR QUE EL PRIMER VALOR SEA ANTES O IGUAL AL SEGUNDO VALOR Y QUE EL SEGUNDO VALOR SEA DESPUÉS DE O IGUAL AL PRIMER VALOR. |  |  |
|  |  |  | No está vacía |  |  |  |
|  |  | Campo tipo URL | Contiene | Text input |  |  |
|  |  |  | No contiene | Text input |  |  |
|  |  |  | Es igual a | Text input |  |  |
|  |  |  | No es igual a | Text input |  |  |
|  |  |  | No está vacía |  |  |  |
| Opción simple / Dropdown / Sí-No | Opción (Incluye todas las opciones creadas por el usuario + las adicionales "Otro" y "Ninguna de las anteriores") |  | Es igual a | Select simple con opciones de la pregunta |  |  |
|  |  |  | No es igual a | Select simple con opciones de la pregunta |  |  |
|  |  |  | No está vacía |  |  |  |
|  | Comentario | Select múltiple de Opciones ceradas por el usuario + las adicionales "Otro" y "Ninguna de las anteriores" dependiendo de si está habilitado "Comentario por opción" o  comentarios en las opciones adicionales | Contiene | Text input |  |  |
|  |  |  | No contiene | Text input |  |  |
|  |  |  | Está en la lista | Tag input. Si hay más de una opción ingresada, se las debe tratar como subcondiciones con el conector OR |  |  |
|  |  |  | No está en la lista | Tag input. Si hay más de una opción ingresada, se las debe tratar como subcondiciones con el conector OR |  |  |
|  |  |  | Es igual a | Text input |  |  |
|  |  |  | No es igual a | Text input |  |  |
|  |  |  | Habla de | Un select con buscador incluído que trae todas las etiquetas (N1>N2>N3) de los modelos que están activos en el estudio. Esta propiedad aparece solo si esta pregunta tiene activa la funcionalidad de categorizar respuesta |  |  |
|  |  |  | No habla de | Un select con buscador incluído que trae todas las etiquetas (N1>N2>N3) de los modelos que están activos en el estudio. Esta propiedad aparece solo si esta pregunta tiene activa la funcionalidad de categorizar respuesta |  |  |
|  |  |  | No está vacía |  |  |  |
| Opción múltiple / Selección de imágenes | Opción | Select que Incluye todas las opciones creadas por el usuario + las adicionales "Otro", "Ninguna de las anteriores" y "Seleccionar todas") | Contiene | Select múltiple con opciones de la pregunta |  |  |
|  |  |  | No contiene | Select múltiple con opciones de la pregunta |  |  |
|  |  |  | Es igual a | Select múltiple con opciones de la pregunta |  |  |
|  |  |  | No es igual a | Select múltiple con opciones de la pregunta |  |  |
|  |  |  | No está vacía |  |  |  |
|  | Comentario | Select múltiple de Opciones ceradas por el usuario + las adicionales "Otro" y "Ninguna de las anteriores" dependiendo de si está habilitado "Comentario por opción" o  comentarios en las opciones adicionales | Contiene | Text input |  |  |
|  |  |  | No contiene | Text input |  |  |
|  |  |  | Es igual a | Text input |  |  |
|  |  |  | No es igual a | Text input |  |  |
|  |  |  | Habla de | Un select con buscador incluído que trae todas las etiquetas (N1>N2>N3) de los modelos que están activos en el estudio. Esta propiedad aparece solo si esta pregunta tiene activa la funcionalidad de categorizar respuesta |  |  |
|  |  |  | No habla de | Un select con buscador incluído que trae todas las etiquetas (N1>N2>N3) de los modelos que están activos en el estudio. Esta propiedad aparece solo si esta pregunta tiene activa la funcionalidad de categorizar respuesta |  |  |
|  |  |  | No está vacía |  |  |  |
| Casilla de verificación |  |  | Es igual a | Radio buttons de opciones "Aceptó" y "No aceptó" |  |  |
|  |  |  | No es igual a | Radio buttons de opciones "Aceptó" y "No aceptó" |  |  |
| MaxDiff | Select simple con las opciones "Más importante" o "Menos importante" |  | Es igual a | Select simple con opciones de la pregunta |  |  |
|  |  |  | No es igual a | Select simple con opciones de la pregunta |  |  |
|  |  |  | No está vacía |  |  |  |
| Ranking | Select simple de posición (número de opciones en la pregunta) |  | Es igual a | Dar espacio para ordenar las opciones como en el editor |  |  |
|  |  |  | No es igual a | Dar espacio para ordenar las opciones como en el editor |  |  |
|  |  |  | No está vacía |  |  |  |
| Rating |  |  | Es igual a | Select múltiple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo"). LAS OPCIONES FUNCIONAN A MANERA DE "OR": NPS es igual a 8 OR 2. |  |  |
|  |  |  | No es igual a | Select múltiple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo"). LAS OPCIONES FUNCIONAN A MANERA DE "OR": NPS no es igual a 8 OR 2. |  |  |
|  |  |  | Es mayor que | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Es mayor o igual a | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Es menor que | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Es menor o igual a | Select simple con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 o "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo") |  |  |
|  |  |  | Esta entre | Dos selects simples para rangos con opciones de la pregunta (Ejm: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10). APLICA SOLO PARA ESCALAS NUMÉRICAS, NO DE TEXTO. SE DEBE VALIDAR QUE EL PRIMER VALOR SEA MENOR O IGUAL AL SEGUNDO Y EL SEGUNDO DEBE SER MAYOR O IGUAL AL PRIMERO. |  |  |
|  |  |  | No está vacía |  |  |  |

# Variables-ahora

| CONDICIONALES VARIABLES |  |  |
|---|---|---|
| TIPO | CONDICIÓN | OBSERVACIÓN |
| Texto | Contiene | Text input |
|  | No contiene | Text input |
|  | Está en la lista | Tag input |
|  | No está en la lista | Tag input |
|  | Es igual a | Text input |
|  | No es igual a | Text input |
|  | Está vacía |  |
|  | No está vacía |  |
| Número | Es igual a | Number input |
|  | No es igual a | Number input |
|  | Es mayor que | Number input |
|  | Es mayor o igual a | Number input |
|  | Es menor que | Number input |
|  | Es menor o igual a | Number input |
|  | Esta entre | Dos Number Inputs para rangos. SE DEBE VALIDAR QUE EL PRIMER VALOR SEA MENOR O IGUAL AL SEGUNDO Y EL SEGUNDO DEBE SER MAYOR O IGUAL AL PRIMERO. |
|  | Está vacía |  |
|  | No está vacía |  |
| Fecha | Es igual a | Date picker con tiempo (dd-mm-aaaa HH:mm:ss) para dateTime y solo con fecha para date. |
|  | No es igual a | Date picker con tiempo (dd-mm-aaaa HH:mm:ss) para dateTime y solo con fecha para date. |
|  | Es después de | Date picker con tiempo (dd-mm-aaaa HH:mm:ss) para dateTime y solo con fecha para date. |
|  | Es antes de | Date picker con tiempo (dd-mm-aaaa HH:mm:ss) para dateTime y solo con fecha para date. |
|  | Está entre | Dos date pickers para rangos. Cada date picker con tiempo (dd-mm-aaaa HH:mm:ss) para dateTime y solo con fecha para date. SE DEBE VALIDAR QUE EL PRIMER VALOR SEA ANTES O IGUAL AL SEGUNDO VALOR Y QUE EL SEGUNDO VALOR SEA DESPUÉS DE O IGUAL AL PRIMER VALOR. |
|  | Está vacía |  |
|  | No está vacía |  |
| Correo electrónico | Contiene | Text input |
|  | No contiene | Text input |
|  | Pertenece a los dominios |  |
|  | No pertenece a los dominios |  |
|  | Es igual a | Text input |
|  | No es igual a | Text input |
|  | Está vacía |  |
|  | No está vacía |  |

