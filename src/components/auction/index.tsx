'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { ActivitySquare, Receipt } from 'lucide-react';
import { Separator } from '../ui/separator';
import moment from 'moment';
import { Button } from '../ui/button';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import * as signalR from '@aspnet/signalr';
import events from '../emitter';
import { useService } from '../service';

type AuctionProps = {};

const Auction: React.FC<AuctionProps> = () => {
  const date = new Date();
  const amount = 18500000;
  const phoneNumber = '04593835234';
  const currentAmount = 185000000;
  const [array, setArray] = useState<any>([]);
  const [arrayMessage, setArrayMessage] = useState<any>();
  const preAmount = 5000000;
  const [multiplyBy, setMultiplyBy] = useState<number>(1);

  let hubConnection: signalR.HubConnection;
  const [connectId, setConnectId] = useState<any>();
  const [messageResult, setMessageResult] = useState<any>();
  const [list, setList] = useState([{
    BienSo: "89-B1 99999"
  },
  { BienSo: "26-B1 11111" },
  { BienSo: "22-B1 22222" }])
  const { createHubConnection, JoinGroup, sendOffersToGroup, OffersToGroup, OnMessageReceived,groupName } = useService({ })

  useEffect(() => {
    const offerToGroup = (message: any, connectId1: any) => {
      let _arr = array
      if (array.length > 0 && array[array.length - 1].ContextId === message.ContextId) {
        return;
      }
      _arr.push(message)
      setConnectId(connectId1);
      setArray(_arr)

    }
    const onMessageReceived = (message: any) => {
      var group = document.getElementById('group')?.innerText;
      if(message.BienSo.item1 == group)
      {
        setMessageResult(message)
      }
    }
    events.addListener('offerToGroup', offerToGroup)
    events.addListener('onMessageReceived', onMessageReceived)

  }, [])
  const askServer = () => {
    (hubConnection);

    hubConnection?.invoke("SendOffersToUser", "hi")
      .catch(err => console.error(err));
  }

  const askServerListener = () => {
    hubConnection?.on("SendOffersToUser", (someText) => {
    })
  }

  useEffect(() => {
    createHubConnection();
    OffersToGroup();
    OnMessageReceived();
  }, [createHubConnection, OffersToGroup, OnMessageReceived]);

  const calculatedAmount = useMemo(() => {
    return multiplyBy * preAmount;
  }, [multiplyBy]);
  const total = useMemo(() => {
    return calculatedAmount + currentAmount;
  }, [calculatedAmount]);


  const hiddenPhoneNumber = phoneNumber.substring(0, 4) + '*'.repeat(phoneNumber.length - 4);
  return (
    <div className="bg-black h-screen">
      <div>
        {list.filter(p => p.BienSo !== groupName).map(item => {
          return <button className='bg-white aspect-square w-1/7 p-10' onClick={() => {
            JoinGroup(item.BienSo);
          }}>
            {item.BienSo}</button>
        })}
        <p id='group' style={{opacity:0}}>{groupName}</p>
      </div>
      <div className="h-header bg-[#0F1A2A]" style={{color:'white'}}>{messageResult?.Message}</div>
      <div className="flex items-end pr-7 pt-7 h-content card flex-col gap-10 ">
        <Card className="h-1/3 overflow-y-auto w-1/3 bg-[#0F1A2A] border-neutral-600 px-1 text-[#E1D9D1]">
          <CardHeader>
            <div className="flex justify-center items-center gap-4">
              <ActivitySquare />
              <p className="text-[#E1D9D1] font-medium"> Diễn biến đấu giá</p>
            </div>
            <Separator className="bg-neutral-600 my-8" />
          </CardHeader>
          {array?.map((item: any, index: any) => {
            return item.BienSo == groupName ? (
                <CardContent key={index} className="flex justify-between items-center">
                <div>
                  <p
                    style={{
                      textShadow: `${index === 0 ? '3px 3px 15px #D1A001, -2px 1px 25px #D1A001' : ''}`,
                    }}
                    className={` mb-2  ${index === 0 ? ' font-bold' : 'font-medium'}`}
                  >
                    {item.BienSo}
                  </p>
                  <p className="text-sm text-neutral-400">{moment(date).format('DD/MM/YYYY • hh:mm:ss')}</p>
                </div>
                <p className={`${index === 0 ? 'text-[#B90201]' : 'text-[#D1A001]'}`}>{item.Message}</p>
              </CardContent>
            ) : null;
          })}
        </Card>
        <Card className=" overflow-y-auto w-1/3 bg-[#0F1A2A] border-neutral-600 px-1 text-[#E1D9D1]">
          <CardHeader>
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Receipt className="text-neutral-400" />
                <p className="text-neutral-400 "> Giá hiện tại</p>
              </div>
              <p className="text-[#E1D9D1] font-medium">{amount.toLocaleString().replace(/,/g, '.')}</p>
            </div>
            <Separator className="bg-neutral-600 my-8" />
          </CardHeader>
          <CardContent className="">
            <div className=" flex justify-between">
              <div className="border-neutral-600 border-[1px] rounded-[40px] relative w-32 h-9 flex items-center justify-center">
                {/* <input className=" outline-none border-none  bg-transparent w-32 h-9 px-3" /> */}
                <p className="outline-none border-none  bg-transparent">
                  {preAmount.toLocaleString().replace(/,/g, '.')}
                </p>
                <p className=" bg-[#0F1A2A] text-neutral-500 absolute top-[-17px]  left-[10px]">Trước giá</p>
              </div>
              <p className="font-bold text-lg self-center">X</p>
              <div className="flex justify-between p-1 w-32 h-9 border-neutral-600 border-[1px] rounded-[40px] items-center">
                <Button
                  onClick={() => setMultiplyBy(multiplyBy - 1)}
                  className="rounded-full h-full aspect-square text-[#02DCA8] bg-[#022144]"
                  disabled={multiplyBy === 1}
                >
                  -
                </Button>
                <p>{multiplyBy}</p>
                <Button
                  onClick={() => setMultiplyBy(multiplyBy + 1)}
                  className="rounded-full h-full aspect-square full text-[#02DCA8] bg-[#022144]"
                >
                  +
                </Button>
              </div>
              <p className="font-bold text-lg self-center">=</p>
              <div className="border-neutral-600 border-[1px] rounded-[40px] w-32 h-9 flex items-center justify-center">
                <span>{calculatedAmount.toLocaleString().replace(/,/g, '.')}</span>
              </div>
            </div>
            <Button
              onClick={() => {
                sendOffersToGroup(groupName, "a", "a", "5");
              }}
              className="w-full bg-primary hover:bg-primary-hover rounded-full mt-8"
            >
              {' '}
              Trả giá {total.toLocaleString().replace(/,/g, '.')}{' '}
            </Button>
            <div>
              <p className='text-white' ></p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auction;
