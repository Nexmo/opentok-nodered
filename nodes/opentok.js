var OpenTok = require('opentok')
var mustache = require("mustache")

module.exports = function(RED) {
  
    function createsession(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.creds = RED.nodes.getNode(config.creds);  
        node.on('input', function (msg) {
          var data = dataobject(this.context(), msg)
          this.options = {
            mediaMode : config.mediamode,
            location : mustache.render(config.location, data),
            archiveMode : config.archivemode
          }
          clean(this.options);
          var opentok = new OpenTok(this.creds.credentials.apikey, this.creds.credentials.apisecret);
          opentok.createSession(this.options, function(err, session) {
            if (err) return console.log(err);
            msg.payload=session.sessionId;
            node.send(msg)
          });
        });
  }
  
  
  function generatetoken(config) {
      RED.nodes.createNode(this, config);
      var node = this;
      this.creds = RED.nodes.getNode(config.creds);  
      node.on('input', function (msg) {
        var data = dataobject(this.context(), msg)
        this.sessionid = mustache.render(config.sessionid, data),
        this.options = {
          role : config.role,
          data : mustache.render(config.data, data),
          expireTime : mustache.render(config.expiretime, data),
        }
        clean(this.options);
        var opentok = new OpenTok(this.creds.credentials.apikey, this.creds.credentials.apisecret);
        msg.payload = opentok.generateToken(this.sessionid, this.options);
        node.send(msg)
      });
}


  function startarchive(config) {
      RED.nodes.createNode(this, config);
      var node = this;
      this.creds = RED.nodes.getNode(config.creds);  
      node.on('input', function (msg) {
        var data = dataobject(this.context(), msg)
        this.sessionid = mustache.render(config.sessionid, data),
        this.options = {
          name : mustache.render(config.archivename, data),
          hasVideo : config.hasvideo,
          outputMode: config.outputmode
        }
        clean(this.options);
        var opentok = new OpenTok(this.creds.credentials.apikey, this.creds.credentials.apisecret);
        msg.payload = opentok.startArchive(this.sessionid, this.options);
        node.send(msg)
      });
}


  function stoparchive(config) {
      RED.nodes.createNode(this, config);
      var node = this;
      this.creds = RED.nodes.getNode(config.creds);  
      node.on('input', function (msg) {
        var data = dataobject(this.context(), msg)
        this.archiveid = mustache.render(config.archiveid, data)
        var opentok = new OpenTok(this.creds.credentials.apikey, this.creds.credentials.apisecret)
        opentok.stopArchive(this.archiveid, function(err, archive) {
          if (err) return console.log(err)
          msg.payload =  archive.id
          node.send(msg)
        });
      });
}


  function getarchive(config) {
      RED.nodes.createNode(this, config);
      var node = this;
      this.creds = RED.nodes.getNode(config.creds);  
      node.on('input', function (msg) {
        var data = dataobject(this.context(), msg)
        this.archiveid = mustache.render(config.archiveid, data)
        var opentok = new OpenTok(this.creds.credentials.apikey, this.creds.credentials.apisecret);
        opentok.getArchive(this.archiveid, function(err, archive) {
          if (err) return console.log(err)
          msg.payload =  archive
          node.send(msg)
        });
      });
}

  function dial(config) {
      RED.nodes.createNode(this, config);
      var node = this;
      this.creds = RED.nodes.getNode(config.creds);  
      node.on('input', function (msg) {
        var data = dataobject(this.context(), msg)
        this.sessionid = mustache.render(config.sessionid, data)
        this.token = mustache.render(config.token, data)
        this.sipuri = mustache.render(config.sipuri, data)
        this.options = {
          headers : mustache.render(config.headers, data),
          auth : {
            username : mustache.render(config.sipuser, data),
            password : mustache.render(config.sippassword, data),
          },
          secure : config.secure,
          from: mustache.render(config.sipfrom, data)
        }
        clean(this.options)
        var opentok = new OpenTok(this.creds.credentials.apikey, this.creds.credentials.apisecret);
        opentok.dial(this.sessionid, this.token, this.sipuri, this.options, function(err, response) {
          if (err) return console.log(err)
          msg.payload =  JSON.stringify(response)
          node.send(msg)
        });
      });
}


  function signal(config) {
      RED.nodes.createNode(this, config);
      var node = this;
      this.creds = RED.nodes.getNode(config.creds);  
      node.on('input', function (msg) {
        var data = dataobject(this.context(), msg)
        this.sessionid = mustache.render(config.sessionid, data)
        this.connectionid = mustache.render(config.connectionid, data)
        this.payload = JSON.parse(mustache.render(config.payload, data))
        console.log(this,)
        var opentok = new OpenTok(this.creds.credentials.apikey, this.creds.credentials.apisecret);
        opentok.signal(this.sessionid, this.connectionid, this.payload, function(err, response) {
          if (err) return console.log(err)
          msg.payload =  JSON.stringify(response)
          node.send(msg)
        });
      });
}


  function opentokauth(n){
     RED.nodes.createNode(this, n);
     this.apikey = n.apikey;
     this.apisecret = n.apisecret;
}
  
  
 RED.nodes.registerType("generatetoken",generatetoken);
 RED.nodes.registerType("createsession",createsession);
 RED.nodes.registerType("startarchive",startarchive);
 RED.nodes.registerType("stoparchive",stoparchive);
 RED.nodes.registerType("getarchive",getarchive);
 RED.nodes.registerType("dial",dial);
 RED.nodes.registerType("signal",signal);
 RED.nodes.registerType("opentokauth",opentokauth, {
    credentials: {
      apikey: {type:"text"},
      apisecret: {type:"text"}
    }
 });    
}

function clean(obj) {
  for (var propName in obj) { 
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === "") {
      delete obj[propName];
    }
  }
}

function dataobject(context, msg){
  data = {}
  data.msg = msg;
  data.global = {};
  data.flow = {};
  g_keys = context.global.keys();
  f_keys = context.flow.keys();
  for (k in g_keys){
    data.global[g_keys[k]] = context.global.get(g_keys[k]);
  };
  for (k in f_keys){
    data.flow[f_keys[k]] = context.flow.get(f_keys[k]);
  };
  return data
}