include('chargen/lootTables.js');

////////////////////////////////////////////////////////////////////////////////////
//////////                       CLASS SELECTION                     ///////////////
////////////////////////////////////////////////////////////////////////////////////

var classes = ["None", "Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard", "Blood Hunter"];
var selected_classes = [];

// The first node
d3.select("div#classSelectorView")
    .append("select")
    .on('change',classSelectorUpdate)
    .selectAll('option')
    .data(classes).enter()
    .append('option')
    .text(function (d) { return d; })

function classSelectorUpdate(str) {
    //  getting the values
    selected_classes = [];
    d3.selectAll('select')
        .each(function(d) {
            // removing extra
            if( strListIncludes("None", selected_classes) ) {
                this.remove();
            } else {
                selected_classes[selected_classes.length] = d3.select(this).property('value')
            }
    });

    // adding an extra node when nescessary
    if(selected_classes[selected_classes.length-1]!="None") {
            d3.select("div#classSelectorView")
                .append("select")
                .on('change',classSelectorUpdate)
                .selectAll('option')
                .data(classes).enter()
                .append('option')
                .text(function (d) { return d; })
    } else {
        selected_classes.pop();
    }
}

function generateBaseCharacter(keywords) {
    // generating the character
    var character = {
        keywords: keywords,
        armor: randTable(armorLootTable, keywords),
        armor_prop: '',
        weapon_range: randTable(weaponLootTable, keywords, "range"),
        weapon_range_prop: '',
        weapon_mainHand: randTable(weaponLootTable, keywords, "melee"),
        weapon_mainHand_prop: '',
        weapon_offHand: '',
        weapon_offHand_prop: '',   
        others: [],
        mundanes: []
    }
    // if the other hand is free, fill it up
    if(!getLootProperties(character["weapon_mainHand"], weaponLootTable).includes("2h"))
        character["weapon_offHand"] = randTable(weaponLootTable, keywords, "offHand");

    // retrieving the properties of the equipped items
    if(character["armor"]!='')
        character["armor_prop"] =           [character["armor"].toLowerCase(),            ...getLootProperties(character["armor"],            armorLootTable).split(' ')];
    character["weapon_range_prop"] =        [character["weapon_range"].toLowerCase(),     ...getLootProperties(character["weapon_range"],     weaponLootTable).split(' ')];
    character["weapon_mainHand_prop"] =     [character["weapon_mainHand"].toLowerCase(),  ...getLootProperties(character["weapon_mainHand"],  weaponLootTable).split(' ')];
    if(character["weapon_offHand"]!='') 
        character["weapon_offHand_prop"] =  [character["weapon_offHand"].toLowerCase(),   ...getLootProperties(character["weapon_offHand"],   weaponLootTable).split(' ')];

    return character;
}

function getCharacterString(character) {
    // generating the output
    console.log("Armor:")
    if(character["armor"]!='') console.log("   "+character["armor"])
    console.log("Weapons:")
    console.log("   "+character["weapon_mainHand"])
    if(character["weapon_offHand"]!='') console.log("   "+character["weapon_offHand"])
    console.log("   "+character["weapon_range"])
    console.log("Other magical items:")
    for(key in character["others"]) console.log("   "+character["others"][key])
    console.log("Other mundane items:")
    for(key in character["mundanes"]) console.log("   "+character["mundanes"][key])
    console.log("")
}

function equipItem(item, item_prop, character) {
    var mutedTerms = ["armor","weapon","wondrous","potion","staff","scroll","wand","rod","ring","ammo","attuned"]
    var attunements = 0;

    item_prop_muted = strListExclude(item_prop, mutedTerms);
    item_usable = false;

    if(item_prop[0] == "armor") {
        //check if the item is usable
        if(character["armor"]!='') item_usable = strListIncludesAny (character["armor_prop"], item_prop_muted);
        if(item_prop_muted.length==0) item_usable = true;
        if(strListIncludes("magical", character["armor_prop"])) item_usable = false; //check if an item is already equiped

        // equip the item
        if(item_usable) {
            character["armor_prop"].push("magical");
            character["armor"] = item+" ("+character["armor"]+")"
        }
    }else if(item_prop[0] == "weapon") {
        //check if the item is usable
        var equiped = false;
        item_usable = strListIncludesAny (character["weapon_mainHand_prop"], item_prop_muted);
        if(item_prop_muted.length==0) item_usable = true;
        if(strListIncludes("magical", character["weapon_mainHand_prop"])) item_usable = false; //check if an item is already equiped

        // equip the item
        if(item_usable) {
            character["weapon_mainHand_prop"].push("magical");
            character["weapon_mainHand"] = item+" ("+character["weapon_mainHand"]+")"
            equiped = true;
        }

        if(!equiped) {
            //check if the item is usable
            if(character["weapon_offHand"]!='') item_usable = strListIncludesAny (character["weapon_offHand_prop"], item_prop_muted);
            if(item_prop_muted.length==0) item_usable = true;
            if(strListIncludes("magical", character["weapon_offHand_prop"])) item_usable = false; //check if an item is already equiped

            // equip the item
            if(item_usable) {
                character["weapon_offHand_prop"].push("magical");
                character["weapon_offHand"] = item+" ("+character["weapon_offHand"]+")"
                equiped = true;
            }
        }
    }else{
        item_usable |= strListIncludesAny (character["keywords"], item_prop_muted);
        if(item_prop_muted.length==0) item_usable = true;
        if(item_usable) character["others"].push(item);
    }

    return item_usable;
}

function generateCharacter() {
    var points_major = 20;
    var points_minor = 20;

    // get the character keywords
    var keywords = selected_classes;
    for(w in keywords) {
        keywords[w] = keywords[w].replace(' ','');
        keywords[w] = keywords[w][0].toLowerCase()+keywords[w].slice(1);
    }
    keywords.push(...classKeywords[keywords[0]]);

    // generating the character
    var character = generateBaseCharacter(keywords);

    // getting items
    var attunements = 0;
    while(points_major>0) {
        // selecting table
        t = randRangeInt(0, majorTables.length-1);

        item = randTable(majorTables[t]);
        item_prop = getLootProperties(item, majorTables[t]).split(' ');
        console.log("M["+Math.pow(2,t+1)+"] "+item+": "+item_prop)

        if(strListIncludes("attuned", item_prop) && attunements>=3) continue;

        // try to equip the item
        if(equipItem(item, item_prop, character)) {
            if(strListIncludes("attuned", item_prop) ) attunements++;
            points_major -= Math.pow(2,t+1);
        }
    }

    while(points_minor>0) {
        // selecting table
        t = randRangeInt(0, minorTables.length-1);

        item = randTable(minorTables[t]);
        item_prop = getLootProperties(item, minorTables[t]).split(' ');
        console.log("m["+Math.pow(2,t)+"] "+item+": "+item_prop)

        if(strListIncludes("attuned", item_prop) && attunements>=3) continue;

        // try to equip the item
        if(equipItem(item, item_prop, character)) {
            if(strListIncludes("attuned", item_prop) ) attunements++;
            points_minor -= Math.pow(2,t);
        }
    }
    
    getCharacterString(character);
}

// TODO mundane
// Garantee magic armor / weapon
// Point buy system to be improved