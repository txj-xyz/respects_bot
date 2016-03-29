var respectsPaid = 0;
var status = [];
var config = require("./config.json");
var auth = {
	email: config.email,
	password: config.password
};
//start bot file here
var Discordie = require("discordie");
var Events = Discordie.Events;
var client = new Discordie();
try { auth } catch(e) {console.log(e)}
function connect() { client.connect(auth); }
connect();


client.Dispatcher.on(Events.GATEWAY_READY, e => {
  console.log("Connected as: " + client.User.username);
});

status.ignore={
	"users":[],
	"servers":[],
	"channels":[]
	};
	try {
	  status.ignore=require(config.blocklist);
	} catch(err) {
    jsonfile.readFile(config.blocklist, function(err, obj) {
      status.ignore=obj;
    })
	}
  function Exists(obj,varr) {
    for (var key in obj) {
      if (obj[key].indexOf(varr) > -1) {
        return true
      }
    }
  return false
}

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
  //console.log(e.message.author.username + " | " + e.message.content)
  //invite system
  if(e.message.author.id == config.botid && e.message.isPrivate) return
    if(e.message.isPrivate && e.message.content.indexOf("discord.gg") >= 0){
      var code = /https?:\/\/discord\.gg\/([A-Za-z0-9-]+)\/?/.exec(e.message.content)[1];
      client.Invites.resolve(code).then(function(value) {
				if(client.Guilds.find(g => g.name == value.guild.name) >= 1){
					e.message.channel.sendMessage("already there")
						return
				}else{
          client.Invites.accept(code)
          e.message.channel.sendMessage(":ok_hand:")
        }
      }, function(reason) {
        e.message.channel.sendMessage(":thumbsdown:")
      });
    }
  //end invite system

  var msg = e.message.content.split(" ");
  var InputTag = [];
  var i = 1;
  for(i=1; i<msg.length; i++)
  {
    var t = msg[i];
    InputTag.push(t);
  }
  var args = InputTag.join(" ");
  //start defining commands here
  if(!Exists(status.ignore['channel'],e.message.channel.id)){
    function exists(arr, v) {
       return status.ignore[arr].indexOf(v) > -1;
    };
    if(exists("channels",e.message.channel.id)==false){
      //commands start here
      if (e.message.content == "f" || e.message.content == "F"){
        respectsPaid++
        e.message.channel.sendMessage(e.message.author.username + " has paid their respects. :eyes:\nRespects paid so far: **" + respectsPaid + "**");
        return
      }
      if(msg[0] == config.prefix + "help" || msg[0] == config.prefix + "cmd"){
        e.message.channel.sendMessage("`(OP)" + config.prefix + "block | " + config.prefix + "help | " + config.prefix + "cmd | (OP)" + config.prefix + "eval | (OP)" + config.prefix + "tools | " + config.prefix + "i | 'f' or 'F' to pay respects.`")
        return
      }
			if(msg[0] == config.prefix + "i"){
				var mentionedUser = e.message.mentions[0];
				if(!mentionedUser) return e.message.channel.sendMessage(":thumbsdown: no mention")
				e.message.channel.sendMessage("```javascript\n" + require("util").inspect(client.Users.get(mentionedUser.id).memberOf(e.message.channel.guild)) + "```")
			}
      if(msg[0] == config.prefix + "block" && e.message.author.id === config.bot_owner){
        if(msg[1] == "channel"){
          status.ignore["channels"].push(e.message.channel.id);
          require('fs').writeFileSync(config.blocklist, JSON.stringify(status.ignore, null, '\t'))
          e.message.channel.sendMessage(":ok_hand: b l o c k e d   b o y s")
          return
        }else return e.message.channel.sendMessage(":thumbsdown:")
      }
			if(msg[0] == config.prefix + "tools" && e.message.author.id == config.bot_owner){
				if(msg[1] == "mute"){
					var mentionedUser = e.message.mentions[0];
					if(!mentionedUser) return e.message.channel.sendMessage("no user found")
					if(client.Users.get(mentionedUser.id).memberOf(e.message.channel.guild).mute){
						client.Users.get(mentionedUser.id).memberOf(e.message.channel.guild).serverUnmute()
						e.message.channel.sendMessage("unmuted :thumbsdown:")
						return
					}else{
						client.Users.get(mentionedUser.id).memberOf(e.message.channel.guild).serverMute()
						e.message.channel.sendMessage("muted :ok_hand:")
						return
					}
				}else if(msg[1] == "kick"){
						var mentionedUser = e.message.mentions[0];
						if(!mentionedUser) return e.message.channel.sendMessage("no user found")
						client.Users.get(mentionedUser.id).memberOf(e.message.channel.guild).kick().then(function(success) {
							e.message.channel.sendMessage("kicked " + mentionedUser.username.toLowerCase())
			      }, function() {
			        e.message.channel.sendMessage(":thumbsdown: no perms")
							return
			      });
				}else if(msg[1] == "ban"){
						var mentionedUser = e.message.mentions[0];
						if(!mentionedUser) return e.message.channel.sendMessage("no user found")
						client.Users.get(mentionedUser.id).memberOf(e.message.channel.guild).ban(7).then(function(success) {
							e.message.channel.sendMessage("banned " + mentionedUser.username.toLowerCase())
			      }, function() {
			        e.message.channel.sendMessage(":thumbsdown: no perms")
							return
			      });
				}
			}
      if(msg[0] == config.prefix + "eval" && e.message.author.id === config.bot_owner){
        try{
          e.message.channel.sendMessage("```javascript\n" + eval(args) + "```")
          return
	}catch(err){
          e.message.channel.sendMessage(":thumbsdown: `" + err + "`");
          return
	}
      }
      if(e.message.content.indexOf("<@162377752312283147>") >= 0){
        e.message.channel.sendMessage(":eyes:")
        return
      }
      //commands end here
    }
  }
});
