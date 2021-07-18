# Guess the word (Pictionary) ?
Web based pictionary application where group of users can play together.  

## Note
This was a prototype i created to present in Bauer. (hence the sphagetti code =) )

## How to run it locally
Git Clone or download the project locally and run docker compose to spin up all the listed service below.

### Stack
- Node
- Express
- SocketIo
- Postgres
- Redis
- Docker
- Sequelize (ORM)

### How does multiplayer work ?
One user creates a room where other users will join a room by inputting the created room name. ie: Sky.
Created room name is stored in Redis service. Any ongoing game related data, such as Game scores, who is currently drawing, are all stored in Redis until the game is finished.
Uses Socket to pass data across multiple users in a room.

### How does the singleplayer work ?
In singleplayer mode canvas context will start drawing automatically by using the cordinates. Shoutout to google quick draw datasets. Wrote a tiny python script to parse GBs worth of data into what i wanted.
Uses express and Postgres to store game data.

## TODO
- Write unit test to cover all the functions
- Refactor codebase
- Rewrite client side using React


