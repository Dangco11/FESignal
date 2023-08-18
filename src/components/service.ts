import React, { useCallback, useEffect, useState } from 'react';
import * as signalR from '@aspnet/signalr';
import event from './emitter';
type serviceProps = {
  groupName?: string;
  setGroupName?: any;
};
export const useService = (props: serviceProps) => {
  const [groupName, setGroupName] = useState();
  var hubConnection: signalR.HubConnection;
  const createHubConnection = () => {
    hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7186/offers', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();
    hubConnection
      ?.start()
      .then(() => {
        console.log('Hub Connection Started!');
        askServerListener();
        askServer();
      })
      .catch((err) => 'Error while starting connection: ' + err);
  };
  const askServer = () => {
    hubConnection?.invoke('SendOffersToUser', 'hi').catch((err) => console.error(err));
  };
  const askServerListener = () => {
    hubConnection?.on('SendOffersToUser', (someText) => {});
  };
  const sendOffersToGroup = (groupName: any, nameUser: any, UserId: any, content: any) => {
    let group = { GroupName: groupName, UserId: UserId, UserName: nameUser, AmountMoney: content };
    hubConnection
      ?.invoke('SendOffersToGroup', group)
      .finally(() => {
       
      })
      .catch((err) => console.error(err));
  };
  const OffersToGroup = () => {
    hubConnection?.on('SendOffersToGroup', (message: any, connectId1: any) => {
      event.emit('offerToGroup', message, connectId1);
    });
  };

  const JoinGroup = (groupName: any) => {
    setGroupName(groupName);
    hubConnection
      ?.invoke('AddToGroup', groupName)
      .finally(() => {
      })
      .catch((err) => console.error(err));
  };
  
  const OnMessageReceived = ()=>{
    hubConnection?.on("OnMessageReceived", (message: any) => {
        event.emit('onMessageReceived',message)  
    })}
  return { createHubConnection, JoinGroup, sendOffersToGroup,OffersToGroup ,OnMessageReceived,groupName};
};
