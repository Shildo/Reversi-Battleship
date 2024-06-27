# Reversi and Battleship

This is my first ever "big" project that, looking back now, is actually small, but at the time it was big for me. It is the final assignment for a subject in college. There are a couple of games here to play: Reversi and Battleship, as the repository name displays. You can download it and play in your window. Go easy on it since it was from when I was starting to code in JavaScript and frameworkless. Hope you like it! (it's hideous)

## Games Included
1. **Reversi**
2. **Battleship**

## How to Install and Run

### Prerequisites
- Node.js and npm installed on your machine.

### Installation
1. Clone the repository to your local machine:
    ```sh
    git clone <your-repo-url>
    ```
2. Navigate to the project directory:
    ```sh
    cd <project-directory>
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```

### Running the Project
To start the project, run:
```sh
npm start
```
This will launch the application. From there, you can select either Reversi or Battleship from the menu.

## How to play
1. Select a Game: Choose either Reversi or Battleship from the menu.
2. Create a Room: Create a game room, which will generate a code.
3. Join a Room: Share the code with a friend to join the game. Note that the game is designed for local play, so the second player needs to join from another window on the same PC.
4. Gameplay: Enjoy playing the game.

## Important notes
* The game boards are saved locally in a JSON file.
* The board state is preserved even if you close the game window. The JSON file is only deleted when the game ends.
* To restart a game, you can manually delete the JSON file or finish the game.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

