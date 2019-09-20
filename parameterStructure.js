var terrainParams = {
    engine: {
        seed: {
            changeOnGeneration: true,
            currentSeed: 0
        },
        baseGrid: {
            extent: {
                width: 1,
                height: 1
            },
            numberPoints: 16384
        },
        terrainGenerator: {
            type: "Island",
            islandParameters: {
                baseLandmassNumber: 50,
                relaxLevel: 10,
                erosionLevel: 5,
                seaLevelRange: [0.4, 0.6],
                fillSinks: true,
                coastSmoothingLevel: 3
            },
            coastParameters: {
                baseLandmassNumber: 50,
                relaxLevel: 10,
                erosionLevel: 5,
                seaLevelRange: [0.2, 0.6],
                fillSinks: true,
                coastSmoothingLevel: 3
            }
        },
        nameGenerator: {
            type: "Markov",
            markovParameters: {
                dictionnary: "random",
                order: 3,
                prior: 0.01,
                numberLetters: [3, 15]
            },
            mewoParameters: {}
        },
        population: {
            numberCities: 15,
            numberTerritories: 5
        },
        biomes: {
            mountainSlopeThreeshold: 0.35,
            treeSeedProbability: 0.01,
            treeSpreadingLevel: 10
        }
    },
    renderer: {
        fontSizes: {
            region: 40,
            city: 25,
            town: 20
        },
        colors: {
            type: 'random',
            sea: '#00b6dd',
            rivers: '#00d0ff',
            dirt: '#c9ae7b',
            mountainTop: '#ffffff'
        }
    },
    features: {
        coasts: {
            colorGradient: true
        },
        mountains: {
            doMountains: true,
            density: 1000,
            heightScaling: 1, 
            markBiome: true,
            biomeShadeLevel: 0.2,
            shadeLevel: 1
        },
        forests: {
            doForests: true,
            density: 20000,
            heightScaling: 1,
            widthScaling: 1,
            pine: {
                trunkColor: '#661a00',   
                foliageBase: '#32844e',
                foliageShade: '#006622'
            },
            oak: {
                trunkColor: '#661a00',
                foliageBase: '#72a604',
                foliageShade: '#32844e'
            }
        },
        hills: {},
        plains: {},
        cities: {
            doCities: true,
            strokeSize: 0.75,
            city: {
                numberBuildings: [8, 12],
                numberFeatures: [1, 3]
            },
            town: {
                numberBuildings: [3, 6],
                numberFeatures: [0, 1]
            },
            building: {
                width: [2/20, 3/20],
                floors: [1, 2],
                heigthFloor : [2/20, 3/20],
                heightRoof: [1/20, 3/20],
                windowsPerFloor: [1, 2],
                flagChance: 0.1
            },
            feature: {
                width: [3/20, 6/20],
                floors: [3, 4],
                heigthFloor : [2/20, 3/20],
                heightRoof: [2/20, 4/20],
                windowsPerFloor: [1, 3],
                flagChance: 0.8
            },
            flagScaling: 1.0,
            colors: {
                wall: {
                    base: "#c4c3c2",
                    shade: "#9c9c9b"
                },
                roof: {
                    base: "#faae70",
                    shade: "#c88b59"
                },
                structure: "#faae70",
                door: "#faae70",
                curtain: "#ff5c33",
                window: "#8b9c9f",
                flag: "#ff0000",
            }
        }
    },
    generated: {}
}