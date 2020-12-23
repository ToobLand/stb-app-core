sanitize_escape = require("./sanitize_escape");
const validator = require("validator");

const functionsList = {};

functionsList.validateSchema = async (
	title,
	body,
	type,
	userData,
	authLevel,
	roleLevel
) => {
	if (title == "") {
		return new Error("error in script. titel van object mee geven");
	} else {
		const schema = require("../../../model/" + title + "/schema.json");
		var values = {};
		if (schema.columns.hasOwnProperty("id_user")) {
			if (type == "new") {
				body.id_user = userData.id;
			}
			if (type == "update" && (authLevel == 3 || authLevel == 4)) {
				if (body.hasOwnProperty("id_user")) {
					delete body.id_user;
				}
			}
		}

		for (var key in schema.columns) {
			if (body.hasOwnProperty(key)) {
				let get_condition = false; // for get requests it's possible to send a condition. so make sure it's correct and doesn't break this function
				if (
					body[key] === Object(body[key]) &&
					typeof body[key][1] != "undefined"
				) {
					if (Object.keys(body[key]).length == 2) {
						// get condition added.
						// custom condition

						if (
							body[key][0] == "=" ||
							body[key][0] == ">=" ||
							body[key][0] == "<=" ||
							body[key][0] == "<" ||
							body[key][0] == ">" ||
							body[key][0] == "!=" ||
							body[key][0] == "IN"
						) {
							get_condition = body[key][0];
							var value = body[key][1];

							var checkit = sanitize_escape.toDbFromClient(
								schema.columns[key],
								key,
								value
							);
						} else {
							return new Error(
								title + "." + key + " : Condition is not legit."
							);
						}
					} else {
						return new Error(
							title +
								"." +
								key +
								" : Condition is not legit. { id:{'>=','10'} }"
						);
					}
				} else {
					var value = body[key];

					var checkit = sanitize_escape.toDbFromClient(
						schema.columns[key],
						key,
						value
					);
				}
				if (checkit instanceof Error) {
					return new Error(title + "." + key + " : " + checkit.message); // is error
				} else {
					if (get_condition) {
						values[key] = [get_condition, checkit];
					} else {
						values[key] = checkit;
					}
				}
			} else {
				if (type == "get") {
					continue;
				} // if 'get' request, missing columns is no problem, is just for where values in query
				if (type == "update") {
					// if 'update', missing collumns is no problem IF 'id' is present.
					if (body.hasOwnProperty("id")) {
						if (!validator.toInt(body["id"])) {
							return new Error(title + ".id : Has to be an INTEGER for update");
						} else {
							continue;
						}
					}
				}
				if (schema.columns[key].required == "1") {
					if (type == "new" && key == "id") {
						// is oke. ID is autoincrement.
					} else {
						return new Error(
							title + "." + key + " : This column (key) is required"
						);
					}
				} else {
					if (schema.columns[key].standard_value != "") {
						values[key] = schema.columns[key].standard_value;
					}
				}
			}
		}
		return values;
	}
};
module.exports = functionsList;

/*
// DE ARRAY MET OBJECTEN UIT DE MYSQL WEER LEESBAAR MAKEN VOOR CLIENT
functionsList.fromDbToClient=(field,responsSQL)=>{
    var cleanResult=[];
                      
    for(var i=0;i<responsSQL.length;i++){
        cleanResult[i]={};
        for (var key in responsSQL[i]) {
            var skip=false;
            if(db_structure[field].fields.hasOwnProperty(key)){
                if(responsSQL[i][key]!='' && responsSQL[i][key]!==null && typeof responsSQL[i][key]!=='undefined'){
                    // encrypted values decrypten
                    if(db_structure[field].fields[key].encrypt=='1'){
                        var dc = crypto.createDecipheriv("aes-128-ecb", sanitize_escape.convertCryptKey(""+keys.encryptionKey+""), "");
                        var decrypted = dc.update(responsSQL[i][key], 'hex', 'utf8') + dc.final('utf8');
                        responsSQL[i][key]= decrypted;
                    }
                    if(db_structure[field].fields[key].encrypt=='2'){
                        responsSQL[i][key]=cryptr.decrypt(responsSQL[i][key]); 
                    }
                    if(db_structure[field].fields[key].encrypt=='3'){ // als bcrypt value. dan weghalen. Heb je niks aan , dus ook niet mee sturen.
                        responsSQL[i][key]="";
                        skip=true;
                    } 
                    if(db_structure[field].fields[key].type=='string'){
                        responsSQL[i][key]=validator.unescape(responsSQL[i][key]);
                    }
                }else{
                    if(responsSQL[i][key]===null){
                        responsSQL[i][key]='';
                    }
                }
            }
            if(!skip){
                cleanResult[i][key]={};
                cleanResult[i][key]=responsSQL[i][key];
            } 
        }
    }
    return cleanResult;
}
*/
