# PBFT in Blockchain

Implementation of practical byzantine fault tolerance in blockchain

Accompanying article: https://medium.com/coinmonks/implementing-pbft-in-blockchain-12368c6c9548


## Documentation

### System configuration

Update the number of nodes in the system by setting the value of `NUMBER_OF_NODES` in the `config.js` file.

Update the maximum number of transactions to be stored in a block by setting `TRANSACTION_THRESHOLD` in `config.js` file.

### Run nodes

Run the nodes using the following commands (assuming that the total nodes are 3)

First node:
```
SECRET="NODE0" P2P_PORT=5000 HTTP_PORT=3000 node app
```

Second node:
```
SECRET="NODE1" P2P_PORT=5001 HTTP_PORT=3001 PEERS=ws://localhost:5000 node app
```

Third node:
```
SECRET="NODE2" P2P_PORT=5002 HTTP_PORT=3002 PEERS=ws://localhost:5001,ws://localhost:5000 node app
```

*Note the ports are different since all the nodes are running on the same pc and the `PEERS` variable contains a comma seperated list of socket addresses neighbouring nodes*

*Also note that in the ports **300X** are HTTP Ports and `localhost:300X/endpoint-name` should be used to send request to the backend.*

*Ports **500X** are for socket servers and are used to create socket connection between different nodes.*


### Create transactions

**POST `/transact`**

#### Body - JSON Object

**Required Fields**
- **data** - JSON Object

```json
{
	"data": {
		"temporary" : "data"
	}
}
```
**Response**

JSON Object with list of transactions 

```json
[
    {
        "id": "18017a20-f45c-11ea-a67e-058e0ab7cf36",
        "from": "276ab32fb62ccc18fcb9c0e792092b9b6911e53b75f951211b232cf84de061bf",
        "input": {
            "data": {
                "temporary": "data"
            },
            "timestamp": 1599848696515
        },
        "hash": "63b805e0e39384bb419ca688846fb806b7a4551c05769c1dd4b5e91b92a3baca",
        "signature": "1375322E39B05C6AE384AFB806FDB874D344E5237A0D4405FF0BE7086F78F6775901C175791AF51F7BF5982385668D67EE144E82DBA8CF7ADCB63FEDA4B5CB02"
    }
]
```


Create multiple transactions using this end point for any node. All transactions will be distributed among the neighbouring nodes and soon to the entire network. Once the transaction count reach the threshold all node will initiate the consesus protocol.

### Get transactions

**GET `/transactions`**

**Response**
JSON Object containing list of transactions in the transaction pool.

```json
[
    {
        "id": "af57d900-f45c-11ea-a7ba-79f17df47d35",
        "from": "276ab32fb62ccc18fcb9c0e792092b9b6911e53b75f951211b232cf84de061bf",
        "input": {
            "data": {
                "temporary": "data"
            },
            "timestamp": 1599848950417
        },
        "hash": "d8adcfd6cd136903266a103e86fe769eb2c2c91620d97c062681f5cbaa4c6fd2",
        "signature": "A91C6F9831509A3844B00CB65ADD13233DD8DF78E210D3AA933FAB6184AC4EA54E46A492DA6B5821BE4782688584EB6402C59C277DFA02B3E0573A50EA800E00"
    },
    {
        "id": "bca80d00-f45c-11ea-a7ba-79f17df47d35",
        "from": "276ab32fb62ccc18fcb9c0e792092b9b6911e53b75f951211b232cf84de061bf",
        "input": {
            "data": {
                "temporary": "data2"
            },
            "timestamp": 1599848972752
        },
        "hash": "447c710b0e6382a21e220f7688e932369417d8ac8e5e69fee297b800474306af",
        "signature": "ADC5150CD9C1CE4DAFE1623BCB0758271AFCE108768C2FB4C26E8A58DDFC95C99E3972928E90BE87906E2A395004F6A2CEEC691C698073DA27CE9F651EB9990E"
    }
]
```

### Get blocks

After hitting the threshold, the nodes will agree upon a block and add it to the chain. Get the chain using the below end point

**GET `/blocks`**

**Response**
JSON Object containing list of blocks

```json
[
    {
        "timestamp": "genesis time",
        "lastHash": "----",
        "hash": "genesis-hash",
        "data": [],
        "proposer": "P4@P@53R",
        "signature": "SIGN",
        "sequenceNo": 0
    },
    {
        "timestamp": 1599849133103,
        "lastHash": "genesis-hash",
        "hash": "857221a4d3f200bb8456b0b0dc90d6da76c3f13230753ea7993c4d3ee8d8a75b",
        "data": [
            {
                "id": "af57d900-f45c-11ea-a7ba-79f17df47d35",
                "from": "276ab32fb62ccc18fcb9c0e792092b9b6911e53b75f951211b232cf84de061bf",
                "input": {
                    "data": {
                        "temporary": "data"
                    },
                    "timestamp": 1599848950417
                },
                "hash": "d8adcfd6cd136903266a103e86fe769eb2c2c91620d97c062681f5cbaa4c6fd2",
                "signature": "A91C6F9831509A3844B00CB65ADD13233DD8DF78E210D3AA933FAB6184AC4EA54E46A492DA6B5821BE4782688584EB6402C59C277DFA02B3E0573A50EA800E00"
            },
            {
                "id": "bca80d00-f45c-11ea-a7ba-79f17df47d35",
                "from": "276ab32fb62ccc18fcb9c0e792092b9b6911e53b75f951211b232cf84de061bf",
                "input": {
                    "data": {
                        "temporary": "data2"
                    },
                    "timestamp": 1599848972752
                },
                "hash": "447c710b0e6382a21e220f7688e932369417d8ac8e5e69fee297b800474306af",
                "signature": "ADC5150CD9C1CE4DAFE1623BCB0758271AFCE108768C2FB4C26E8A58DDFC95C99E3972928E90BE87906E2A395004F6A2CEEC691C698073DA27CE9F651EB9990E"
            },
            {
                "id": "1a719a50-f45d-11ea-a7ba-79f17df47d35",
                "from": "276ab32fb62ccc18fcb9c0e792092b9b6911e53b75f951211b232cf84de061bf",
                "input": {
                    "data": {
                        "temporary": "data2"
                    },
                    "timestamp": 1599849130101
                },
                "hash": "424dfd403865aeb7a8fbe8fe44d7b892cc8bcb7b67ceb8758497297c0289a80c",
                "signature": "E3A37A14BA56D7FFBA0DF9943E99ACFF71A2C61CE2DB9BE96AB4F4BFD92E1CE9702404542D04FF9F6334F4822D96F7279007A206BD324A3BB785CB4CD667060B"
            },
            {
                "id": "1b743d40-f45d-11ea-a7ba-79f17df47d35",
                "from": "276ab32fb62ccc18fcb9c0e792092b9b6911e53b75f951211b232cf84de061bf",
                "input": {
                    "data": {
                        "temporary": "data2"
                    },
                    "timestamp": 1599849131796
                },
                "hash": "fde375143dab525261cfbc32839289816b3414c0e35b5c14f53f1362b579faed",
                "signature": "9BB6152D31356F2ACFDAB740438E529DE2AE8B03660F5C67E6595CC4006B8541674317177772C4FCBD5156EE807F690A930D4682F3DAD300960631A3AC8C8E0C"
            },
            {
                "id": "1c24a180-f45d-11ea-a7ba-79f17df47d35",
                "from": "276ab32fb62ccc18fcb9c0e792092b9b6911e53b75f951211b232cf84de061bf",
                "input": {
                    "data": {
                        "temporary": "data2"
                    },
                    "timestamp": 1599849132952
                },
                "hash": "37ffe4eabfb49339742e2d07723189b5d861c6e72d96a741270613d9d0f173b7",
                "signature": "2F55E0BC7E177A6738AD1FCB363F6E33AD38802EBB86F29C8E17D30E6FF14BEACE594146581EF97D8D98357468F8E62C9C4A5A2522A58B7DF0F4C94D0109C508"
            }
        ],
        "proposer": "5864f1e7d7e37e95882b398c21ca29b314ebfc6ea1286c8dc1201214cc0d0686",
        "signature": "DDFB628EB5E506EF458CD6D3A788BD459A039130F7ED56D91A6E2FB2EE6E2AC591883E2FF7154CFA4D000900F26E5550B6631E7773BFE2C2D94F854A8A0C5D00",
        "sequenceNo": 1,
        "prepareMessages": [
            {
                "blockHash": "857221a4d3f200bb8456b0b0dc90d6da76c3f13230753ea7993c4d3ee8d8a75b",
                "publicKey": "276ab32fb62ccc18fcb9c0e792092b9b6911e53b75f951211b232cf84de061bf",
                "signature": "F3A381CC4DEEBF83D599BA300401EE36D1873FAF2B3F75F7AB5C4588D90CDD5B4C6F728359FA769CC188DEC17DAABC3290B44100E2A71AAEA22E7B8B90024A00"
            },
            {
                "blockHash": "857221a4d3f200bb8456b0b0dc90d6da76c3f13230753ea7993c4d3ee8d8a75b",
                "publicKey": "a47fc60f15b1e5195c8a03c2ef5d0173efd66bf38c1962f38ac79acb430354c3",
                "signature": "C813A362465D5426F6D736B8A28A2D61B8E9B7B8F5451237346CCC455BF8F79FBE41446665760524E6A4019E3C93DF677D23BBBB470F207063A4534EA79C2108"
            },
            {
                "blockHash": "857221a4d3f200bb8456b0b0dc90d6da76c3f13230753ea7993c4d3ee8d8a75b",
                "publicKey": "5864f1e7d7e37e95882b398c21ca29b314ebfc6ea1286c8dc1201214cc0d0686",
                "signature": "DDFB628EB5E506EF458CD6D3A788BD459A039130F7ED56D91A6E2FB2EE6E2AC591883E2FF7154CFA4D000900F26E5550B6631E7773BFE2C2D94F854A8A0C5D00"
            }
        ],
        "commitMessages": [
            {
                "blockHash": "857221a4d3f200bb8456b0b0dc90d6da76c3f13230753ea7993c4d3ee8d8a75b",
                "publicKey": "276ab32fb62ccc18fcb9c0e792092b9b6911e53b75f951211b232cf84de061bf",
                "signature": "F3A381CC4DEEBF83D599BA300401EE36D1873FAF2B3F75F7AB5C4588D90CDD5B4C6F728359FA769CC188DEC17DAABC3290B44100E2A71AAEA22E7B8B90024A00"
            },
            {
                "blockHash": "857221a4d3f200bb8456b0b0dc90d6da76c3f13230753ea7993c4d3ee8d8a75b",
                "publicKey": "a47fc60f15b1e5195c8a03c2ef5d0173efd66bf38c1962f38ac79acb430354c3",
                "signature": "C813A362465D5426F6D736B8A28A2D61B8E9B7B8F5451237346CCC455BF8F79FBE41446665760524E6A4019E3C93DF677D23BBBB470F207063A4534EA79C2108"
            },
            {
                "blockHash": "857221a4d3f200bb8456b0b0dc90d6da76c3f13230753ea7993c4d3ee8d8a75b",
                "publicKey": "5864f1e7d7e37e95882b398c21ca29b314ebfc6ea1286c8dc1201214cc0d0686",
                "signature": "DDFB628EB5E506EF458CD6D3A788BD459A039130F7ED56D91A6E2FB2EE6E2AC591883E2FF7154CFA4D000900F26E5550B6631E7773BFE2C2D94F854A8A0C5D00"
            }
        ]
    }
]
```


## Final thoughts
This was simplified implementation of PBFT and can be extended further by 
1. Combining all pools into one to make a generic pool.
1. Adding STATE variable in the project and update it whenever a new state is reached.
1. Clearing commit, prepare and message pool after every new round to save memory space.
1. Create a registration method in blockchain to add new validators dynamically and handle disconnections.
1. Create a cryptocurrency using this project as a base.
1. Use multi-threading to make this project concurrent and faster.
