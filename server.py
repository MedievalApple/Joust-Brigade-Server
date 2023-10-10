import asyncio
import websockets
import json
import logging

logging.basicConfig(level=logging.INFO)

# Maintain a list of connected clients
connected_clients = set()

# Maintain a list of connected players
connected_players = {}

async def handle_connection(websocket, path):
    # Add the connected client to the list
    connected_clients.add(websocket)

    # Send all connected players to the new client
    for user in connected_players:
        logging.info(f"Sending connected player {user} to new client")
        await websocket.send(json.dumps({
            "action": "join",
            "user": user
        }))

    try:
        async for message in websocket:
            message = json.loads(message)
            
            if "content" in message:
                content = message['content']

            # logging.info(f"Received message: {message}")

            if message['action'] == "join":
                connected_players[message['user']] = {
                    "name": message['user'],
                    "socket": websocket,
                    "position": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "velocity": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    }
                }

                for client in connected_clients:
                    await client.send(json.dumps({
                        "action": "join",
                        "user": message['user']
                    }))
            elif message['action'] == "update":
                connected_players[message['user']] = {
                    "name": message['user'],
                    "socket": websocket,
                    "position": content['position'],
                    "velocity": content['velocity']
                }

                for client in connected_clients:
                    if client != websocket:
                        await client.send(json.dumps({
                            "action": "update",
                            "user": message['user'],
                            "position": content['position'],
                            "velocity": content['velocity']
                        }))

            else:
                logging.warning(f"Unknown message action: {message['action']}")
    except websockets.exceptions.ConnectionClosed:


        logging.info("Connection closed")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
    finally:
        connected_clients.remove(websocket)

        for player_name, player_data in connected_players.items():         
            if player_data["socket"] == websocket:
                disconnectName = player_name
        print(disconnectName)

        

        if disconnectName:
            for client in connected_clients:
                await client.send(json.dumps({
                    "action": "remove",
                    "user": disconnectName
                }))

        index = 0

        for player_name, player_data in connected_players.items():
            index += 1
            if player_data["socket"] == websocket:
                break
        
        connected_players.remove(index)



if __name__ == "__main__":
    start_server = websockets.serve(handle_connection, "10.223.16.17", 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
