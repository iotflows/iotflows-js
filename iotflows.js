/**
 * Copyright 2021 IoTFlows Inc. All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable laconsole.w or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/


var mqtt = require("mqtt");
var fetch = require('node-fetch');

class iotflows {
    
    // Connect to the server
    constructor(username, password, willTopic, willPayload) 
    {     
        var self = this;
        this.subscriptions = {};
        this.username = username;
        this.authHeader = {'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString("base64")}
        this.options = {
            clientId: `iotflows-js-username-${username}-${(new Date().getTime())}`,
            username: username,
            password: password, 
            keepalive: 10,
            clean: true,
            reconnectPeriod: 5000,
            rejectUnauthorized: false,
            protocolId: 'MQIsdp',
            protocolVersion: 3 
        }

        if(willTopic && willPayload) {
            this.options.will = {
                topic: willTopic,
                payload: willPayload,
                qos: 2,
                retain: false
            }            
        }
                
        this.client = mqtt.connect('wss://wss.connect.iotflows.com:443/mqtt', this.options)

        this.client.on('connect', function () {
            console.log("Connected to the server.")                                                                    
        })

        // this.client.on('message', function (topic, message) {  
        //     console.log("Received a message:")
        //     console.log(message.toString())            
        // })        
    }

    // Fetch the authorized topics for this client
    async init()
    {
        var self = this;

        // Get the data stream topics
        try{
            await fetch(`https://api.iotflows.com/v1/device_clients/${self.username}/project_data_streams`, {
                headers: self.authHeader
            })
            .then(res => res.json())
            .then(json => {                
                // array 
                // organization_uuid, project_uuid, device_uuid, data_stream_uuid 
                // console.log(json)
                self.data_streams = json;
                // console.log("Read the data streams.")
            });
        }
        catch (e) {
            console.error("Error: can't read the data stream topics.")
        }


        // Get the alert channel topics
        try{
            await fetch(`https://api.iotflows.com/v1/device_clients/${self.username}/organization_alert_channels`, {
                headers: self.authHeader
            })
            .then(res => res.json())
            .then(json => {                
                // array 
                // organization_uuid, alert_channel_uuid
                // console.log(json)
                self.alert_channels = json;
                // console.log("Read the alert channel topics.")
            });
        }
        catch (e) {
            console.error("Error: can't read the alert channel topics.")
        }
        
        // Get the action topics
        try{
            await fetch(`https://api.iotflows.com/v1/device_clients/${self.username}/project_actions`, {
                headers: self.authHeader
            })
            .then(res => res.json())
            .then(json => {                
                // array 
                // organization_uuid, project_uuid, device_uuid, action_uuid
                // console.log(json)
                self.actions = json;
                // console.log("Read the alert channel topics.")
            });
        }
        catch (e) {
            console.error("Error: can't read the alert channel topics.")
        }
        
    }     
   
    /**
     * Publish a message to a data stream
     * 
     * @param {Object} dataStream 
     * @param {string} dataStream.data_stream_uuid The uuid of the data stream
     * @param {string} dataStream.data The data to be published to the data stream
     */
    async publish(dataStream)
    {
        var self = this;
        var hasThisDataStream = false;
        if(!self.data_streams) {console.error("Error: no data streams found."); return;}

        self.data_streams.map(info => {
            if(info.data_stream_uuid == dataStream.data_stream_uuid)
            {
                hasThisDataStream = true;
                // console.log('This data stream info:')
                // console.log(info)                

                let iotflows_payload = {
                    "data": String(dataStream.data),
                    "client_id": self.username,
                    "data_stream_id": dataStream.data_stream_uuid
                }
                let topic = `v1/organizations/${info.organization_uuid}/projects/${info.project_uuid}/devices/${info.device_uuid}/data-streams/${dataStream.data_stream_uuid}`

                self.client.publish(topic, JSON.stringify(iotflows_payload));
                // console.log("publishing...")        
                // console.log(JSON.stringify(iotflows_payload))      
            }
        })             
        if(!hasThisDataStream)      
        {
            console.error("Error: can't find/access this data stream.")
        }
    }
    
    /**
     * Publishes an alert to an alert channel.
     * 
     * @param {Object} alert 
     * @param {string} alert.alert_channel_uuid The uuid of the alert channel
     * @param {string} alert.severity The severity of the alert. It can be MAJOR, MINOR or INFORMATIVE
     * @param {string} alert.subject The subject of the alert
     * @param {string} alert.description The description/message of the alert
     */
    async alert(alert)
    {
        var self = this;
        
        if(!self.alert_channels) {console.error("Error: no alert channels found. Make sure you have used the right credentials and have initialized IoTFlows."); return;}

        if(alert.severity != 'MAJOR' && alert.severity != 'MINOR' && alert.severity != 'INFORMATIVE') { console.error("Error: can't find this alert severity"); return;}

        var hasThisAlertChannel = false;
        self.alert_channels.map(info => {
            if(info.alert_channel_uuid == alert.alert_channel_uuid) 
            {
                hasThisAlertChannel = true;
                // console.log('This alert channel info:')
                // console.log(info)                

                let iotflows_payload = {
                    "severity_level": alert.severity,
                    "subject": alert.subject,
                    "description":  alert.description,
                    "alert_channel_id": alert.alert_channel_uuid,
                    "client_id": self.username                    
                }

                let topic = `v1/organizations/${info.organization_uuid}/alert-channels/${info.alert_channel_uuid}`
                self.client.publish(topic, JSON.stringify(iotflows_payload));
        
            }
        })   
        if(!hasThisAlertChannel)      
        {
            console.error("Error: can't find/access this alert channel.")
        }
    }

    /**
     * Executes an action with a commmand
     * 
     * @param {Object} action 
     * @param {string} action.action_uuid The uuid of the action
     * @param {string} action.payload The payload to be published to the action
     */
    async callAction(action)
    {
        var self = this;
        var hasThisAction = false;
        if(!self.actions) {console.error("Error: no actions found."); return;}
        
        self.actions.map(info => {
            if(info.action_uuid == action.action_uuid)
            {
                hasThisAction = true;

                let iotflows_payload = 
                {
                    "data": action.payload,
                    "client_id": self.username,
                    "action_id": action.action_uuid
                }

                let topic = `v1/organizations/${info.organization_uuid}/projects/${info.project_uuid}/devices/${info.device_uuid}/actions/${action.action_uuid}`

                self.client.publish(topic, JSON.stringify(iotflows_payload));
            }
        })             
        if(!hasThisAction)      
        {
            console.error("Error: can't find/access this action.")
        }
    }
    
    matchTopic(ts, t) {
        if (ts == "#") {
            return true;
        }
        /* The following allows shared subscriptions (as in MQTT v5)
           http://docs.oasis-open.org/mqtt/mqtt/v5.0/cs02/mqtt-v5.0-cs02.html#_Toc514345522

           4.8.2 describes shares like:
           $share/{ShareName}/{filter}
           $share is a literal string that marks the Topic Filter as being a Shared Subscription Topic Filter.
           {ShareName} is a character string that does not include "/", "+" or "#"
           {filter} The remainder of the string has the same syntax and semantics as a Topic Filter in a non-shared subscription. Refer to section 4.7.
        */
        else if(ts.startsWith("$share")){
            ts = ts.replace(/^\$share\/[^#+/]+\/(.*)/g,"$1");

        }
        var re = new RegExp("^"+ts.replace(/([\[\]\?\(\)\\\\$\^\*\.|])/g,"\\$1").replace(/\+/g,"[^/]+").replace(/\/#$/,"(\/.*)?")+"$");
        return re.test(t);
    }

    /**
     * Subscribes to a data stream.
     * 
     * @param {Object} subscription  
     * @param {string} subscription.data_stream_uuid data stream uuid
     * @param {number} subscription.qos quality of service 0, 1, or 2
     * @param {function callback(topic, payload, packet) {}} subscription.callback handler function to be called when data received
     * 
     */
    subscribe(subscription) {                
        var self = this;
        var hasThisDataStream = false;
        if(!self.data_streams) {console.error("Error: no data streams found. Make sure you have used the right credentials and have initialized IoTFlows."); return;}

        self.data_streams.map(info => {
            if(info.data_stream_uuid == subscription.data_stream_uuid)
            {
                hasThisDataStream = true;
                let topic = `v1/organizations/${info.organization_uuid}/projects/${info.project_uuid}/devices/${info.device_uuid}/data-streams/${subscription.data_stream_uuid}`
                
                subscription.ref = subscription.ref||0;
                subscription.qos = subscription.qos||0;
                self.subscriptions[topic] = self.subscriptions[topic] || {};

                var sub = {
                    topic:topic,
                    qos:subscription.qos,
                    handler:function(mtopic, mpayload, mpacket) {
                        if (self.matchTopic(topic, mtopic)) {
                            subscription.callback(mtopic, JSON.parse(mpayload.toString()).data, mpacket);
                        }
                    },
                    ref: subscription.ref
                };
                
                self.subscriptions[topic][subscription.ref] = sub;    
                self.client.on('message', sub.handler);
        
                var options = {};
                options.qos = subscription.qos;
                self.client.subscribe(topic, options);
            }
        })   

        if(!hasThisDataStream)      
        {
            console.error("Error: can't find/access this data stream.")
        }           
    };
 

    /**
     * Defines a cloud action.
     * 
     * @param {Object} defineAction  
     * @param {string} defineAction.action_uuid action uuid
     * @param {number} defineAction.qos quality of service 0, 1, or 2
     * @param {function callback(topic, payload, packet) {}} defineAction.callback handler function to be called when action gets executed
     * 
     */
    defineAction(defineAction) {                
        var self = this;
        var hasThisAction = false;
        if(!self.actions) {console.error("Error: no actions found. Make sure you have used the right credentials and have initialized IoTFlows."); return;}

        self.actions.map(info => {
            if(info.action_uuid == defineAction.action_uuid)
            {
                hasThisAction = true;
                var topic = `v1/organizations/${info.organization_uuid}/projects/${info.project_uuid}/devices/${info.device_uuid}/actions/${defineAction.action_uuid}`
                
                defineAction.ref = defineAction.ref||0;
                defineAction.qos = defineAction.qos||0;
                self.subscriptions[topic] = self.subscriptions[topic] || {};

                var sub = {
                    topic:topic,
                    qos:defineAction.qos,
                    handler:function(mtopic, mpayload, mpacket) {
                        if (self.matchTopic(topic, mtopic)) {
                            defineAction.callback(mtopic, JSON.parse(mpayload.toString()).data, mpacket);
                                            
                            // send a delivery confirmation response
                            let iotflows_payload = 
                            {
                                "client_id": self.username,           
                                "msg_id": JSON.parse(mpayload.toString()).msg_id,
                                "action_id": defineAction.action_uuid
                            }
                            let topicConfirmation = topic.replace('/actions/', '/actions-confirmation/');            
                            self.client.publish(topicConfirmation, JSON.stringify(iotflows_payload));
                        }
                    },
                    ref: defineAction.ref
                };
                
                self.subscriptions[topic][defineAction.ref] = sub;    
                self.client.on('message', sub.handler);
        
                var options = {};
                options.qos = defineAction.qos;
                self.client.subscribe(topic, options);
            }
        })   

        if(!hasThisAction)      
        {
            console.error("Error: can't find/access this action.")
        }           
    };

}


module.exports = iotflows