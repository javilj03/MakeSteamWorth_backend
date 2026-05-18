# Scrapping y API requests

Debes desarrollar un proyecto backend que funcionara como API REST y debe hacer scrapping de una web. No te puedo decir el nombre de la web pero si te puedo dar un ejemplo de su estructura que encontraras en el fichero example.html, ese es el html que muestra los datos a escrapear. Debes crear la estructura que haga el scrapping a una url que yo mismo rellenare en un futuro pero da como salida algo muy muy parecido al ejemplo que te he dado.


## Base de datos
- Debes ademas hacer que el scrapping (a esa web que ya pondre yo) sea cada 30min para mantener los datos actualizados pero para evitar saturacion del servidor ya que se me permiten un numero de peticiones concretas
- La base de datos sera una alojada en azure de tipo PostgreSQL flexible server, con las credenciales en los .env que hay

## API y web scrap
La web que scrappearé ademas cambia su url de la siguiente forma 'https://weboculta/app/<id_juego>' siendo el ID del juego algo que se puede obtener atraves de la API de steam por el nombre. El scrapping de la primera web, la de example.html, tiene la informacion de los 100 primeros juegos, por lo que este endpoint debe comprobar que el juego que se busca no se tenga la informacion(no pertecezca a estos 100 en la BD) y si no pertenece se debe buscar su id y una vez tengamos el id hacer el scraping de una web como example2.html y encontrar la misma informacion que aparece en example.html y lo que se añade a la tabla de la BD.

## Disclaimer
- Este proyecto es un proyecto autonomo y en una red cerrada por lo que el scrapping no se hara a la web de los example.html y example2.html. La intencion es meramete didactica y academica con la intencion de crear un modelo de negocio similar a otro que ya funciona como el de la web de example.html pero por motivos obvios no se hara el scrap directamente a el sino a una propia en otro servidor privado


## Documentacion 
- En cada uno de tus pasos importantes debes crear una carpeta /docs en la que debes crear una estructura de carpetas y ficheros markdown para guardar tus pasos y decisiones. Debes usar un subagente para esto.


# Actualizacion del proyecto
- Este proyecto ya tiene una base hecha ERRONEA, sobre una web que ya no se usa con un esquema html que ya no se usa, lo que debes hacer es cambiar toda la estructura del programa para que vaya sobre la web de la variable env "SCRAPE_TOP_URL". Tienes que actualizar los endpoints con las nuevas URL. Ademas debes de actualizar la documentacion del proyecto.
- ten en cuenta que este proyecto estara en azure por lo que desplegar cualquier interfaz de puppeteer no sera visible 