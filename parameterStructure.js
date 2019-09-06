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
            doCities: true
        }
    },
    generated: {}
}