#!/usr/bin/env node
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
 **/

"use strict";
const inquirer = require('inquirer')
var fs = require('fs');
const fetch = require('node-fetch');
const IoTFlows = require("./iotflows")

async function begin()
{    
    // TODO: add user login / token -> MQTT (HTML/JS)
    // TODO: subscription of wildcard topics of MQTT

    var iotflows = new IoTFlows('dc_0f66191962f3ba6577559d43a2aabe90', '2Vg0Ms4wImoBz1Q]hfYEntF')    
    await iotflows.init();

    // await iotflows.alert({
    //     alert_channel_uuid: '1c39f6f25c29c18d3e0598e4da4faada',
    //     severity: 'MINOR',
    //     subject: 'Water Leak',
    //     description: 'Water leackage detected in Site A.'
    // })    
    
    await iotflows.subscribe({
        data_stream_uuid: '7ea022531d23b8d4a6622e3725b5fba2',        
        callback: function handler(topic, payload){
            console.log("New message received!")        
            console.log(payload)        
        }
    })
    
    await iotflows.defineAction({
        action_uuid: 'fd595610b01703c4e99774815cc806c0',
        callback: function handler(topic, payload){
            console.log("New command received!")        
            console.log(payload)                
        }
    })
            
    // every 3 seconds publish a message and call an action
    setInterval(async function()
    {
        console.log("Publishing a message...")
        await iotflows.publish({
            data_stream_uuid: '7ea022531d23b8d4a6622e3725b5fba2',
            data: '100'
        })    
        console.log("Calling an action...")
        await iotflows.callAction({
            action_uuid: 'fd595610b01703c4e99774815cc806c0',
            payload: false
        })        
    }, 3000);
}

begin()