# iotflows-js

https://iotflows.com

IoTFlows Open Source JavaScript WebSocket SDK.

With this tool you can:
1. Publish secure real-time data streams.
2. Subscribe to the data streams and access real-time data on your web/mobile/IoT apps.
3. Publish alerts to the alert channels with a defined severity level. Subscribers will get notified in the form of SMS/Email/Push.
4. Define cloud actions that can be called from other IoT devices/web applications.

## Installation
Use `npm` to install the iotflows.js module:

```
npm install @iotflows/iotflows-js
```

## Usage
### loadIoTFlows
This function will create and initialize an IoTFlows instance. This is an async function and you would need to use 'await' to ensure proper initialization.

```javascript
const {loadIoTFlows} = require('@iotflows/iotflows-js')
var iotflows = await loadIoTFlows('CLIENT_ID', 'CLIENT_SECRET');
```

Make sure to change `CLIENT_ID` and `CLIENT_SECRET` with the proper credentials obtained from IoTFlows console. 
These credentials can be either one of these options:
1. A [Device Client](https://docs.iotflows.com/real-time-data-streams-alerts-and-actions/create-a-device-api-key) that has permission to interact with the resources available in its project, or
2. An [Organization IoT API KEY](https://docs.iotflows.com/cloud-node-red-servers/subscribe-and-publish-to-real-time-data-streams#create-an-iot-api-key) that can have read-only or read/write permissions to the entire organization resources
3. A [User Client](https://rest-api-docs.iotflows.com/#tag/Users/paths/%7E1v1%7E1users%7E1authorize/get) that is authorized to interact with the permitted resources of the user. This option is most useful when you need to build a web or mobile app. For this option, you need to register your Application in IoTFlows and authenticate users using [OAuth2](https://oauth.net/2). With the obtained [JWT](https://jwt.io/), you can perform a [Basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) HTTP request to generate a User Client.

---

### Publish data stream
To publish a real-time data stream, you need to pass these parameters in a json object:

- data_stream_uuid: the uuid of the data stream
- data: the data to be published to the data stream

Read more:
- [How to create a data stream](https://docs.iotflows.com/iotflows-platform/creating-a-data-stream)

Example:
```javascript
await iotflows.publish({
    data_stream_uuid: 'ds_xxxxxxxxxxxxxxxxxxxxxxx',
    data: '81'
})   
```

---

### Subscribe to data stream
To listen to real-time data streams that are published, you need to define the following parameters in a json object:

- data_stream_uuid: data stream uuid
- qos (optional): quality of service 0, 1, or 2 (0: At most once, 1: At least once, 2: Exactly once)
- subtopic_subscription (optional): boolean flag to subscribe to subtopics
- callback: handler function to be called when data received

Example:
```javascript
await iotflows.subscribe({
    data_stream_uuid: 'ds_xxxxxxxxxxxxxxxxxxxxxxx',        
    subtopic_subscription: true,
    callback: function handler(topic, payload){
        console.log("New message received!")        
        console.log(payload)        
    }
})
```

---

### Unsubscribe from a data stream
To unsubscribe from real-time data streams, you need to define the following parameters in a json object:

- data_stream_uuid: data stream uuid
- qos (optional): quality of service 0, 1, or 2 (0: At most once, 1: At least once, 2: Exactly once)
- subtopic_subscription (optional): boolean flag to unsubscribe from subtopics
- callback: handler function to be called when data received

Example:
```javascript
await iotflows.unsubscribe({
    data_stream_uuid: 'ds_xxxxxxxxxxxxxxxxxxxxxxx',        
    subtopic_subscription: true
})
```

---

### Publish an alert
To publish an alert, you need to pass these parameters in a json object:

- alert_channel_uuid: the uuid of the alert channel
- severity: the severity of the alert. It can be MAJOR, MINOR or INFORMATIVE
- subject: the subject of the alert
- description: the description/message of the alert

Read more:
- [How to create an alert channel](https://docs.iotflows.com/iotflows-platform/alert-channel#creating-an-alert-channel)

Example:
```javascript
await iotflows.alert({
    alert_channel_uuid: 'ac_xxxxxxxxxxxxxxxxxxxxxxxx',
    severity: 'MINOR',
    subject: 'Water Leak',
    description: 'Water leackage detected in Site A.'
})  
```

---

### Define a cloud action
To define a cloud action that can be called from other IoT/web applications, you need to define the following parameters in a json object:

- action_uuid action uuid
- qos (optional): quality of service 0, 1, or 2 (0: At most once, 1: At least once, 2: Exactly once)
- callback: handler function to be called when action gets executed

Read more:
- [How to create an action](https://docs.iotflows.com/iotflows-platform/creating-an-action)

Example:
```javascript
await iotflows.defineAction({
    action_uuid: 'da_xxxxxxxxxxxxxxxxxxxxxxxxx',
    callback: function handler(topic, payload){
        console.log("New command received!")        
        console.log(payload)                
    }
})
```

---

### Call/Execute a cloud action
To publish an alert, you need to pass these parameters in a json object:

- action_uuid: the uuid of the action
- payload: the payload to be published to the action

Example:
```javascript
await iotflows.callAction({
    action_uuid: 'da_xxxxxxxxxxxxxxxxxxxxxxxxx',
    payload: false
})   
```

---

### Publish a generic MQTT message
To publish an MQTT message with a defined topic, you need to pass these parameters:

- topic: the mqtt topic
- payload: the message payload to be sent

Example:
```javascript
await iotflows.publishMQTT(
    'v1/organizations/92c2ddd58730dc9b4e9bb620e7ebcaf5/projects/e9531cc1d542999c0bf081c4147c206a/devices/8d786feef417aeb398f8076fecbe0242/data-streams/7ea022531d23b8d4a6622e3725b5fba2',
    'Hello!'
) 
```

---

### Subscribe to a generic MQTT topic
To subscribe to a generic MQTT topic, you need to define the following parameters:

- topic: the mqtt topic
- callback: the callback handler function that gets triggered once a message is received

Example:
```javascript
iotflows.subscribeMQTT(
    'v1/organizations/92c2ddd58730dc9b4e9bb620e7ebcaf5/#',
    function handler(topic, payload){
        console.log("New message received!")        
        console.log(topic)
        console.log(payload)
    }
)
```

---

### Unsubscribe from a generic MQTT topic
To unsubscribe from a generic MQTT topic, you only need to provide the topic:

- topic: the mqtt topic

Example:
```javascript
await iotflows.unsubscribeMQTT('v1/organizations/92c2ddd58730dc9b4e9bb620e7ebcaf5/#')
```

