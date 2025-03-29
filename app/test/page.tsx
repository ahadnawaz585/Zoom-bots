'use client';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';

type FormValues = {
  meetingId: string;
  password: string;
  quantity: number;
  duration: number;
};

type Bot = {
  id: number;
  name: string;
  status?: string;
};

const Page = () => {
  const [generatedBots, setGeneratedBots] = useState<Bot[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const form = useForm<FormValues>({
    defaultValues: {
      meetingId: '',
      password: '',
      quantity: 1,
      duration: 5,
    },
  });

  const { handleSubmit, register } = form;

  const generateBotNames = (quantity: number): Bot[] => {
    return Array.from({ length: quantity }, (_, i) => ({
      id: i + 1,
      name: `Bot-${i + 1}`,
    }));
  };

  const joinMeeting: SubmitHandler<FormValues> = async (values) => {
    if (!generatedBots.length) {
      toast.error("No bots generated");
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: values.meetingId,
          password: values.password,
          quantity: values.quantity,
          duration: values.duration * 60,
          botNames: generatedBots.map(bot => bot.name),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Bots joining sequentially`);
        setGeneratedBots(prev => prev.map(bot => ({
          ...bot,
          status: data.initialStatuses.find((s: any) => s.id === bot.id)?.status || 'Pending'
        })));
      } else {
        toast.error(data.message || "Failed to join meeting");
      }
    } catch (error) {
      toast.error("Error occurred");
      console.error(error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleClick = () => {
    const quantity = form.getValues('quantity');
    setGeneratedBots(generateBotNames(quantity));
    handleSubmit(joinMeeting)();
  };

  return (
    <div>
      <form onSubmit={handleSubmit(joinMeeting)}>
        <input {...register('meetingId')} placeholder="Meeting ID" />
        <input {...register('password')} placeholder="Password" />
        <input type="number" {...register('quantity', { valueAsNumber: true })} placeholder="Number of bots" />
        <input type="number" {...register('duration', { valueAsNumber: true })} placeholder="Duration (minutes)" />
        <button type="button" onClick={handleClick} disabled={isJoining}>
          {isJoining ? 'Joining...' : 'Start Bots'}
        </button>
      </form>
      {generatedBots.map(bot => (
        <div key={bot.id}>Bot {bot.name}: {bot.status || 'Pending'}</div>
      ))}
    </div>
  );
};

export default Page;