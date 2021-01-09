# iotflows-js

https://iotflows.com

IoTFlows JavaScript SDK.

With this tool you can:
1. Publish secure real-time data streams over MQTTS for IoT projects.
2. Subscribe to data streams with MQTTS and Secure WebSocket. This allows you to access real-time data on web/mobile applications.
3. Publish alerts to the alert channels (SMS/Email/Push).
4. Define cloud actions that can be called from other IoT devices/web applications.

## Quick Start

```
const IoTFlows = require("@iotflows/iotflows-js")

async function begin()
{    
    var iotflows = new IoTFlows('dc_0f66191962f3ba6577559d43a2aabe90', '2Vg0Ms4wImoBz1Q]hfYEntF')    
    await iotflows.init();

    await iotflows.alert({
        alert_channel_uuid: '1c39f6f25c29c18d3e0598e4da4faada',
        severity: 'MINOR',
        subject: 'Water Leak',
        description: 'Water leackage detected in Site A.'
    })       
}

begin()
```
