# iotflows-js

https://iotflows.com

IoTFlows Open Source JavaScript SDK.

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
For this, you would can use either 
1. A Device Client that has permission to interact with the resources available in its project, or
2. An Organization API KEY that can have read-only or read/write permissions to the entire organization resources

Read more:
- [How to create a device client](https://docs.iotflows.com/iotflows-platform/creating-a-device-client) 
- [How to create an organization API key](https://docs.iotflows.com/iotflows-platform/creating-an-organization-api-key)

--

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

--

### Subscribe to data stream
To listen to real-time data streams that are published, you need to define the following parameters in a json object:

- data_stream_uuid: data stream uuid
- qos (optional): quality of service 0, 1, or 2 (0: At most once, 1: At least once, 2: Exactly once)
- callback: handler function to be called when data received

Example:
```javascript
await iotflows.subscribe({
    data_stream_uuid: 'ds_xxxxxxxxxxxxxxxxxxxxxxx',        
    callback: function handler(topic, payload){
        console.log("New message received!")        
        console.log(payload)        
    }
})
```

--

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

--

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

--

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






    