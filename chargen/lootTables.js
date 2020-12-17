////////////////////////////////////////////////////////////////////////////////////
//////////                       CLASS HANDLING                      ///////////////
////////////////////////////////////////////////////////////////////////////////////

var classKeywords = {
    artificer:      ["medium","shield","simple","spellcaster"],
    barbarian:      ["medium","shield","martial"],
    bard:           ["light","simple","thief","spellcaster"],
    cleric:         ["medium","shield","simple","spellcaster"],
    druid:          ["medium","spellcaster"],
    fighter:        ["heavy","shield","martial"],
    monk:           ["simple"],
    paladin:        ["heavy","shield","martial","spellcaster"],
    ranger:         ["medium","shield","martial","spellcaster"],
    rogue:          ["light","simple","thief"],
    sorcerer:       ["mage","spellcaster"],
    warlock:        ["light","simple","spellcaster"],
    wizard:         ["mage","spellcaster"],
    bloodHunter:    ["medium","shield","martial"]
}

////////////////////////////////////////////////////////////////////////////////////
//////////                      BASE ITEM TABLES                     ///////////////
////////////////////////////////////////////////////////////////////////////////////

var armorLootTable = `
Padded,                 light,                                                      1
Leather,                light,                                                      1
Studded leather,        light,                                                      1

Hide,                   medium,                                                     1
Chain shirt,            medium,                                                     1
Scale mail,             medium,                                                     1
Breastplate,            medium,                                                     1
Half plate,             medium,                                                     1

Ring mail,              heavy,                                                      1
Chain mail,             heavy,                                                      1
Splint,                 heavy,                                                      1
Plate,                  heavy,                                                      1
`

var weaponLootTable = `
Club,                   simple melee offHand        druid,                          1
Dagger,                 simple melee offHand        druid mage,                     1
Greatclub,              simple melee 2h,                                            1
Handaxe,                simple melee offHand,                                       1
Javelin,                simple melee                druid,                          1
Light hammer,           simple melee offHand,                                       1
Mace,                   simple melee                druid,                          1
Quaterstaff,            simple melee                druid mage,                     1
Sickle,                 simple melee offHand        druid,                          1
Spear,                  simple melee                druid,                          1

Battleaxe,              martial melee,                                              1
Flail,                  martial melee,                                              1
Glaive,                 martial melee 2h,                                           1
Greataxe,               martial melee 2h,                                           1
Greatsword,             martial melee 2h,                                           1
Hallberd,               martial melee 2h,                                           1
Lance,                  martial melee,                                              1
Longsword,              martial melee               thief,                          1
Maul,                   martial melee 2h,                                           1
Morningstar,            martial melee,                                              1
Pike,                   martial melee 2h,                                           1
Rapier,                 martial melee               thief,                          1
Scimitar,               martial melee offHand       druid,                          1
Shortsword,             martial melee offHand       thief monk,                     1
Trident,                martial melee,                                              1
War pick,               martial melee,                                              1
Warhammer,              martial melee,                                              1
Whip,                   martial melee,                                              1

Crossbow light,         simple range 2h             mage,                           1
Dart,                   simple range                druid mage,                     1
Shortbow,               simple range,                                               1
Sling,                  simple range                druid mage,                     1

Blowgun,                martial range,                                              1
Crossbow hand,          martial range offHand       thief,                          1
Crossbow heavy,         martial range 2h,                                           1
Longbow,                martial range 2h,                                           1
Net,                    martial range,                                              1

shield,                 shield offHand,                                             5
`

////////////////////////////////////////////////////////////////////////////////////
//////////                  MINOR MAGIC ITEM TABLES                  ///////////////
////////////////////////////////////////////////////////////////////////////////////

var minorCommonLootTable =`
Armor of gleaming,                  armor medium heavy,             1
Bead ofurishment,                   wondrous,                       1
Bead of refreshment,                wondrous,                       1
Boots of false tracks,              wondrous,                       1
Candle of the deep,                 wondrous,                       1
Cast-off armor,                     armor medium heavy,             1
Charlatan’s die,                    wondrous attuned,               1
Cloak of billowing,                 wondrous,                       1
Cloak of many fashions,             wondrous,                       1
Clockwork amulet,                   wondrous,                       1
Clothes of mending,                 wondrous,                       1
Dark shard amulet,                  wondrous warlock attuned,       1
Dread helm,                         wondrous,                       1
Ear horn of hearing,                wondrous,                       1
Enduring spellbook,                 wondrous,                       1
Ersatz eye,                         wondrous attuned,               1
Hat of vermin,                      wondrous,                       1
Hat of wizardry,                    wondrous wizard attuned,        1
Heward’s handy spice pouch,         wondrous,                       1
Horn of silent alarm,               wondrous,                       1
Instrument of illusions,            wondrous attuned,               1
Instrument of scribing,             wondrous attuned,               1
Lock of trickery,                   wondrous,                       1
Moon-touched sword,                 weapon sword,                   1
Mystery key,                        wondrous,                       1
Orb of direction,                   wondrous,                       1
Orb of time,                        wondrous,                       1
Perfume of bewitching,              wondrous,                       1
Pipe of smoke monsters,             wondrous,                       1
Pole of angling,                    wondrous,                       1
Pole of collapsing,                 wondrous,                       1
Pot of awakening,                   wondrous,                       1
Potion of climbing,                 potion,                         1
Potion of healing,                  potion,                         1
Rope of mending,                    wondrous,                       1
Ruby of the war mage,               wondrous spellcaster attuned,   1
Shield of expression,               weapon shield,                  1
Smoldering armor,                   armor,                          1
Spell scroll (cantrip),             scroll,                         1
Spell scroll (1st level),           scroll,                         1
Staff of adornment,                 staff,                          1
Staff of birdcalls,                 staff,                          1
Staff of flowers,                   staff,                          1
Talking doll,                       wondrous attuned,               1
Tankard of sobriety,                wondrous,                       1
Unbreakable arrow,                  ammo,                           1
Veteran’s cane,                     wondrous,                       1
Walloping ammunition,               ammo,                           1
Wand of conducting,                 wand,                           1
Wand of pyrotechnics,               wand,                           1
Wand of scowls,                     wand,                           1
Wand of smiles,                     wand,                           1
`

var minorUncommonLootTable =`
Alchemy jug,                        wondrous,                       1
Ammunition +1,                      ammo,                           1
Bag of holding,                     wondrous,                       1
Cap of water breathing,             wondrous,                       1
Cloak of the manta ray,             wondrous,                       1
Decanter of endless water,          wondrous,                       1
Driftglobe,                         wondrous,                       1
Dust of disappearance,              wondrous,                       1
Dust of dryness,                    wondrous,                       1
Dust of sneezing and choking,       wondrous,                       1
Elemental gem,                      wondrous,                       1
Eyes of minute seeing,              wondrous,                       1
Goggles of night,                   wondrous,                       1
Helm of comprehending languages,    wondrous,                       1
Immovable rod,                      rod,                            1
Keoghtom’s ointment,                wondrous,                       1
Lantern of revealing,               wondrous,                       1
Mariner’s armor,                    armor,                          1
Mithral armor,                      armor medium heavy,             1
Oil of slipperiness,                potion,                         1
Periapt of health,                  wondrous,                       1
Philter of love,                    potion,                         1
Potion of animal friendship,        potion,                         1
Potion of fire breath,              potion,                         1
Potion of healing greater,          potion,                         1
Potion of growth,                   potion,                         1
Potion of hill giant strength,      potion,                         1
Potion of poison,                   potion,                         1
Potion of resistance,               potion,                         1
Potion of water breathing,          potion,                         1
Ring of swimming,                   ring,                           1
Robe of useful items,               wondrous,                       1
Rope of climbing,                   wondrous,                       1
Saddle of the cavalier,             wondrous,                       1
Sending stones,                     wondrous,                       1
Spell scroll (2nd level),           scroll,                         1
Spell scroll (3rd level),           scroll,                         1
Wand of magic detection,            wand,                           1
Wand of secrets,                    wand,                           1
`

var minorRareLootTable =`
Ammunition +2,                      ammo,                           1
Bag of beans,                       wondrous,                       1
Bead of force,                      wondrous,                       1
Chime of opening,                   wondrous,                       1
Elixir of health,                   potion,                         1
Folding boat,                       wondrous,                       1
Heward’s handy haversack,           wondrous,                       1
Horseshoes of speed,                wondrous,                       1
Necklace of fireballs,              wondrous,                       1
Oil of etherealness,                potion,                         1
Portable hole,                      wondrous,                       1
Potion of clairvoyance,             potion,                         1
Potion of diminution,               potion,                         1
Potion of fire giant strength,      potion,                         1
Potion of frost giant strength,     potion,                         1
Potion of gaseous form,             potion,                         1
Potion of heroism,                  potion,                         1
Potion of invulnerability,          potion,                         1
Potion of mind reading,             potion,                         1
Potion of stone giant strength,     potion,                         1
Potion of healing superior,         potion,                         1
Quaal’s feather token,              wondrous,                       1
Scroll of protection,               scroll,                         1
Spell scroll (4th level),           scroll,                         1
Spell scroll (5th level),           scroll,                         1
`

var minorVeryRareLootTable =`
Ammunition +3,                      ammo,                           1
Arrow of slaying,                   ammo,                           1
Bag of devouring,                   wondrous,                       1
Horseshoes of a zephyr,             wondrous,                       1
Nolzur’s marvelous pigments,        wondrous,                       1
Oil of sharpness,                   potion,                         1
Potion of cloud giant strength,     potion,                         1
Potion of flying,                   potion,                         1
Potion of invisibility,             potion,                         1
Potion of longevity,                potion,                         1
Potion of speed,                    potion,                         1
Potion of healing supreme,          potion,                         1
Potion of vitality,                 potion,                         1
Spell scroll (6th level),           scroll,                         1
Spell scroll (7th level),           scroll,                         1
Spell scroll (8th level),           scroll,                         1
`

var minorLegendaryLootTable =`
Potion of storm giant strength,     potion,                         1
Sovereign glue,                     wondrous,                       1
Spell scroll (9th level),           scroll,                         1
Universal solvent,                  wondrous,                       1
`

////////////////////////////////////////////////////////////////////////////////////
//////////                  MINOR MAGIC ITEM TABLES                  ///////////////
////////////////////////////////////////////////////////////////////////////////////

var majorUncommonLootTable =`
Adamantine armor,                                   armor medium heavy,                                         1
Amulet of proof against detection and location,     wondrous attuned,                                           1
Bag of tricks,                                      wondrous,                                                   1
Boots of elvenkind,                                 wondrous,                                                   1
Boots of striding and springing,                    wondrous attuned,                                           1
Boots of the winterlands,                           wondrous attuned,                                           1
Bracers of archery,                                 wondrous attuned,                                           1
Brooch of shielding,                                wondrous attuned,                                           1
Broom of flying,                                    wondrous,                                                   1
Circlet of blasting,                                wondrous,                                                   1
Cloak of elvenkind,                                 wondrous attuned,                                           1
Cloak of protection,                                wondrous attuned,                                           1
Deck of illusions,                                  wondrous,                                                   1
Eversmoking bottle,                                 wondrous,                                                   1
Eyes of charming,                                   wondrous attuned,                                           1
Eyes of the eagle,                                  wondrous attuned,                                           1
Figurine of wondrous power (silver raven),          wondrous,                                                   1
Gauntlets of ogre power,                            wondrous attuned,                                           1
Gem of brightness,                                  wondrous,                                                   1
Gloves of missile snaring,                          wondrous attuned,                                           1
Gloves of swimming and climbing,                    wondrous attuned,                                           1
Gloves of thievery,                                 wondrous,                                                   1
Hat of disguise,                                    wondrous attuned,                                           1
Headband of intellect,                              wondrous attuned,                                           1
Helm of telepathy,                                  wondrous attuned,                                           1
Instrument of the bards (Doss lute),                wondrous attuned bard,                                      1
Instrument of the bards (Fochlucan bandore),        wondrous attuned bard,                                      1
Instrument of the bards (Mac-Fuirmidh cittern),     wondrous attuned bard,                                      1
Javelin of lightning,                               weapon javelin,                                             1
Medallion of thoughts,                              wondrous attuned,                                           1
Necklace of adaptation,                             wondrous attuned,                                           1
Pearl of power,                                     wondrous attuned spellcaster,                               1
Periapt of wound closure,                           wondrous attuned,                                           1
Pipes of haunting,                                  wondrous,                                                   1
Pipes of the sewers,                                wondrous attuned,                                           1
Quiver of Ehlonna,                                  wondrous,                                                   1
Ring of jumping,                                    ring attuned,                                               1
Ring of mind shielding,                             ring attuned,                                               1
Ring of warmth,                                     ring attuned,                                               1
Ring of water walking,                              ring,                                                       1
Rod of the pact keeper +1,                          rod attuned warlock,                                        1
Sentinel shield,                                    weapon shield,                                              1
Shield +1,                                          weapon shield,                                              1
Slippers of spider climbing,                        wondrous attuned,                                           1
Staff of the adder,                                 staff attuned cleric druid warlock,                         1
Staff of the python,                                staff attuned cleric druid warlock,                         1
Stone of good luck (luckstone),                     wondrous attuned,                                           1
Sword of vengeance,                                 weapon attuned sword,                                       1
Trident of fish command,                            weapon attuned trident,                                     1
Wand of magic missiles,                             wand,                                                       1
Wand of the war mage +1,                            wand attuned spellcaster,                                   1
Wand of web,                                        wand attuned spellcaster,                                   1
Weapon of warning,                                  weapon attuned,                                             1
Weapon +1,                                          weapon,                                                     1
Wind fan,                                           wondrous,                                                   1
Winged boots,                                       wondrous attuned,                                           1
`

var majorRareLootTable =`
Amulet of health,                                   wondrous attuned,                                           1
Armor of resistance,                                armor attuned,                                              1
Armor of vulnerability,                             armor attuned plate,                                        1
Armor +1,                                           armor,                                                      1
Arrow-catching shield,                              weapon attuned shield,                                      1
Belt of dwarvenkind,                                wondrous attuned,                                           1
Belt of hill giant strength,                        wondrous attuned,                                           1
Berserker axe,                                      weapon attuned axe,                                         1
Boots of levitation,                                wondrous attuned,                                           1
Boots of speed,                                     wondrous attuned,                                           1
Bowl of commanding water elementals,                wondrous,                                                   1
Bracers of defense,                                 wondrous attuned,                                           1
Brazier of commanding fire elementals,              wondrous,                                                   1
Cape of the mountebank,                             wondrous,                                                   1
Censer of controlling air elementals,               wondrous,                                                   1
Cloak of displacement,                              wondrous attuned,                                           1
Cloak of the bat,                                   wondrous attuned,                                           1
Cube of force,                                      wondrous attuned,                                           1
Daern’s instant fortress,                           wondrous,                                                   1
Dagger of venom,                                    weapon dagger,                                              1
Dimensional shackles,                               wondrous,                                                   1
Dragon slayer,                                      weapon sword,                                               1
Elven chain,                                        armor shirt,                                                1
Figurine of wondrous power (bronze griffon),        wondrous,                                                   1
Figurine of wondrous power (ebony fly),             wondrous,                                                   1
Figurine of wondrous power (golden lions),          wondrous,                                                   1
Figurine of wondrous power (ivory goats),           wondrous,                                                   1
Figurine of wondrous power (marble elephant),       wondrous,                                                   1
Figurine of wondrous power (onyx dog),              wondrous,                                                   1
Figurine of wondrous power (serpentine owl),        wondrous,                                                   1
Flame tongue,                                       weapon attuned sword,                                       1
Gem of seeing,                                      wondrous attuned,                                           1
Giant slayer,                                       weapon sword axe,                                           1
Glamoured studded leather,                          armor studded,                                              1
Helm of teleportation,                              wondrous attuned,                                           1
Horn of blasting,                                   wondrous,                                                   1
Horn of Valhalla (silver or brass),                 wondrous,                                                   1
Instrument of the bards (Canaith mandolin),         wondrous attuned bard,                                      1
Instrument of the bards (Cli lyre),                 wondrous attuned bard,                                      1
Ioun stone (awareness),                             wondrous attuned,                                           1
Ioun stone (protection),                            wondrous attuned,                                           1
Ioun stone (reserve),                               wondrous attuned,                                           1
Ioun stone (sustenance),                            wondrous attuned,                                           1
Iron bands of Bilarro,                              wondrous,                                                   1
Mace of disruption,                                 weapon attuned mace,                                        1
Mace of smiting,                                    weapon attuned mace,                                        1
Mace of terror,                                     weapon attuned mace,                                        1
Mantle of spell resistance,                         wondrous attuned,                                           1
Necklace of prayer beads,                           wondrous attuned cleric druid paladin,                      1
Periapt of proof against poison,                    wondrous,                                                   1
Ring of animal influence,                           ring,                                                       1
Ring of evasion,                                    ring attuned,                                               1
Ring of feather falling,                            ring attuned,                                               1
Ring of free action,                                ring attuned,                                               1
Ring of protection,                                 ring attuned,                                               1
Ring of resistance,                                 ring attuned,                                               1
Ring of spell storing,                              ring attuned,                                               1
Ring of the ram,                                    ring attuned,                                               1
Ring of X-ray vision,                               ring attuned,                                               1
Robe of eyes,                                       wondrous attuned,                                           1
Rod of rulership,                                   rod attuned,                                                1
Rod of the pact keeper +2,                          rod attuned warlock,                                        1
Rope of entanglement,                               wondrous,                                                   1
Shield of missile attraction,                       weapon  attuned shield,                                     1
Shield +2,                                          weapon shield,                                              1
Staff of charming,                                  staff attuned bard cleric druid sorcerer warlock wizard,    1
Staff of healing,                                   staff attuned bard cleric druid,                            1
Staff of swarming insects,                          staff attuned bard cleric druid sorcerer warlock wizard,    1
Staff of the woodlands,                             staff attuned druid,                                        1
Staff of withering,                                 staff attuned cleric druid warlock,                         1
Stone of controlling earth elementals,              wondrous,                                                   1
Sun blade,                                          weapon attuned longsword,                                   1
Sword of life stealing,                             weapon attuned sword,                                       1
Sword of wounding,                                  weapon attuned sword,                                       1
Tentacle rod,                                       rod attuned,                                                1
Vicious weapon,                                     weapon,                                                     1
Wand of binding,                                    wand attuned spellcaster,                                   1
Wand of enemy detection,                            wand attuned,                                               1
Wand of fear,                                       wand attuned,                                               1
Wand of fireballs,                                  wand attuned spellcaster,                                   1
Wand of lightning bolts,                            wand attuned spellcaster,                                   1
Wand of paralysis,                                  wand attuned spellcaster,                                   1
Wand of the war mage +2,                            wand attuned spellcaster,                                   1
Wand of wonder,                                     wand attuned spellcaster,                                   1
Weapon +2,                                          weapon,                                                     1
Wings of flying,                                    wondrous attuned,                                           1
`

var majorVeryRareLootTable =`
Amulet of the planes,                               wondrous attuned,                                           1
Animated shield,                                    weapon attuned shield,                                      1
Armor +2,                                           armor,                                                      1
Belt of fire giant strength,                        wondrous attuned,                                           1
Belt of giant strength (frost/stone),               wondrous attuned,                                           1
Candle of invocation,                               wondrous attuned,                                           1
Carpet of flying,                                   wondrous,                                                   1
Cloak of arachnid,                                  wondrous attuned,                                           1
Crystal ball (very rare),                           wondrous attuned,                                           1
Dancing sword,                                      weapon attuned sword,                                       1
Demon armor,                                        armor attuned plate,                                        1
Dragon scale mail,                                  armor attuned scale,                                        1
Dwarven plate,                                      armor plate,                                                1
Dwarven thrower,                                    Weapon attuned warhammer dwarf,                             1
Efreeti bottle,                                     wondrous,                                                   1
Figurine of wondrous power (obsidian steed),        wondrous,                                                   1
Frost brand,                                        weapon attuned sword,                                       1
Helm of brilliance,                                 wondrous attuned,                                           1
Horn of Valhalla (bronze),                          wondrous,                                                   1
Instrument of the bards (Anstruth harp),            wondrous attuned bard,                                      1
Ioun stone (absorption),                            wondrous attuned,                                           1
Ioun stone (agility),                               wondrous attuned,                                           1
Ioun stone (fortitude),                             wondrous attuned,                                           1
Ioun stone (insight),                               wondrous attuned,                                           1
Ioun stone (intellect),                             wondrous attuned,                                           1
Ioun stone (leadership),                            wondrous attuned,                                           1
Ioun stone (strength),                              wondrous attuned,                                           1
Manual of bodily health,                            wondrous,                                                   1
Manual of gainful exercise,                         wondrous,                                                   1
Manual of golems,                                   wondrous,                                                   1
Manual of quickness of action,                      wondrous,                                                   1
Mirror of life trapping,                            wondrous,                                                   1
Nine lives stealer,                                 weapon attuned sword,                                       1
Oathbow,                                            weapon attuned longbow,                                     1
Ring of regeneration,                               ring attuned,                                               1
Ring of shooting stars,                             ring attuned,                                               1
Ring of telekinesis,                                ring attuned,                                               1
Robe of scintillating colors,                       wondrous attuned,                                           1
Robe of stars,                                      wondrous attuned,                                           1
Rod of absorption,                                  rod attuned,                                                1
Rod of alertness,                                   rod attuned,                                                1
Rod of security,                                    rod,                                                        1
Rod of the pact keeper +3,                          rod attuned warlock,                                        1
Scimitar of speed,                                  weapon attuned scimitar,                                    1
Shield +3,                                          weapon shield,                                              1
Spellguard shield,                                  weapon attuned shield,                                      1
Staff of fire,                                      staff attuned druid sorcerer warlock wizard,                1
Staff of frost,                                     staff attuned druid sorcerer warlock wizard,                1
Staff of power,                                     staff attuned sorcerer warlock wizard,                      1
Staff of striking,                                  staff attuned,                                              1
Staff of thunder and lightning,                     staff attuned,                                              1
Sword of sharpness,                                 weapon attuned sword,                                       1
Tome of clear thought,                              wondrous,                                                   1
Tome of leadership and influence,                   wondrous,                                                   1
Tome of understanding,                              wondrous,                                                   1
Wand of polymorph,                                  wand attuned spellcaster,                                   1
Wand of the war mage +3,                            wand attuned spellcaster,                                   1
Weapon +3,                                          weapon,                                                     1
`

var majorLegendaryLootTable =`
Apparatus of Kwalish,                               wondrous,                                                   1
Armor of invulnerability,                           armor attuned plate,                                        1
Armor +3,                                           armor,                                                      1
Belt of cloud giant strength,                       wondrous attuned,                                           1
Belt of storm giant strength,                       wondrous attuned,                                           1
Cloak of invisibility,                              wondrous attuned,                                           1
Crystal ball (legendary),                           wondrous attuned,                                           1
Cubic gate,                                         wondrous,                                                   1
Deck of many things,                                wondrous,                                                   1
Defender,                                           weapon attuned sword,                                       1
Efreeti chain,                                      armor attuned chain,                                        1
Hammer of thunderbolts,                             weapon attuned maul,                                        1
Holy avenger,                                       weapon attuned paladin,                                     1
Horn of Valhalla (iron),                            wondrous,                                                   1
Instrument of the bards (Ollamh harp),              wondrous attuned bard,                                      1
Ioun stone (greater absorption),                    wondrous attuned,                                           1
Ioun stone (mastery),                               wondrous attuned,                                           1
Ioun stone (regeneration),                          wondrous attuned,                                           1
Iron flask,                                         wondrous,                                                   1
Luck blade,                                         weapon attuned sword,                                       1
Plate armor of etherealness,                        armor attuned plate,                                        1
Ring of air elemental command,                      ring attuned,                                               1
Ring of djinni summoning,                           ring attuned,                                               1
Ring of earth elemental command,                    ring attuned,                                               1
Ring of fire elemental command,                     ring attuned,                                               1
Ring of invisibility,                               ring attuned,                                               1
Ring of spell turning,                              ring attuned,                                               1
Ring of three wishes,                               ring,                                                       1
Ring of water elemental command,                    ring attuned,                                               1
Robe of the archmagi,                               wondrous attuned sorcerer warlock wizard,                   1
Rod of lordly might,                                rod attuned,                                                1
Rod of resurrection,                                rod attuned cleric druid paladin,                           1
Scarab of protection,                               wondrous attuned,                                           1
Sphere of annihilation,                             wondrous,                                                   1
Staff of the magi,                                  staff attuned sorcerer warlock wizard,                      1
Sword of answering,                                 weapon attuned longsword,                                   1
Talisman of pure good,                              wondrous attuned,                                           1
Talisman of the sphere,                             wondrous attuned,                                           1
Talisman of ultimate evil,                          wondrous attuned,                                           1
Tome of the stilled tongue,                         wondrous attuned wizard,                                    1
Vorpal sword,                                       Weapon attuned sword,                                       1
Well of many worlds,                                wondrous,                                                   1
`

////////////////////////////////////////////////////////////////////////////////////
//////////                     TABLE MANIPULATION                    ///////////////
////////////////////////////////////////////////////////////////////////////////////

// get the descriptors associated with the loot
function getLootProperties(str, table) {
    for(key in table) {
        if(table[key][0] == str) return table[key][1];
    }
    return null;
}

// convert the tables into a usable format
function cleanTable(strTable) {
    strTable = strTable.split('\n');
    var result = [];
    for(var i in strTable) {
        if(strTable[i]==0) continue;
        strTable[i] = strTable[i].replaceAll('  ','').replaceAll(', ',',');
        strTable[i] = strTable[i].split(',')
        result[result.length] = [strTable[i][0], strTable[i][1], parseFloat(strTable[i][2])];
    }
    return result;
}

// mundane items
armorLootTable =            cleanTable(armorLootTable);
weaponLootTable =           cleanTable(weaponLootTable);

// minor items
minorCommonLootTable =      cleanTable(minorCommonLootTable);
minorUncommonLootTable =    cleanTable(minorUncommonLootTable);
minorRareLootTable =        cleanTable(minorRareLootTable);
minorVeryRareLootTable =    cleanTable(minorVeryRareLootTable);
minorLegendaryLootTable =   cleanTable(minorLegendaryLootTable);
var minorTables = [
                    minorCommonLootTable,
                    minorUncommonLootTable,
                    minorRareLootTable,
                    minorVeryRareLootTable,
                    minorLegendaryLootTable
                    ]


// major items
majorUncommonLootTable =    cleanTable(majorUncommonLootTable);
majorRareLootTable =        cleanTable(majorRareLootTable);
majorVeryRareLootTable =    cleanTable(majorVeryRareLootTable);
majorLegendaryLootTable =   cleanTable(majorLegendaryLootTable);
var majorTables = [
                    majorUncommonLootTable,
                    majorRareLootTable,
                    majorVeryRareLootTable,
                    majorLegendaryLootTable
                    ]