module.exports = {
    "NameSpace": {
        "singlePlayer": "singlePlayer",
    },
    "Redis": {
        "host"    : "redis-15252.c232.us-east-1-2.ec2.cloud.redislabs.com",
        "port"    : 15252,
        "password": "1qJh43IeYXvZjdbjiIx7IfAnBRGv6VKx",
        "old_pwd": "jW4nljDMQrFOXvHQ45N0FuZm61CryS0z",
    },
    "ErrorMessage": {
        "roomNotInDb"        : "Roomname is not valid or verify room name",
        "unknownId"          : "Unknown socket Id",
        "usernameNotValid"   : "username is invalid",
        "getAllClientsInRoom": "Unable to get all client ids in the room",
        "RoomError"          : {
            "ErrorType"  : "roomNotInDb",
            "roomNotInDbMessage": "Room name is not valid or verify room name",
        },
    },
    
    "SuccessMessage": {
        "joinRoom" : true,
        "roomExist": true
    }
}