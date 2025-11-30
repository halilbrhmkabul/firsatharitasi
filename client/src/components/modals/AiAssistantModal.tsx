import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Drawer } from 'vaul';
import { Store } from '../../types';
import { ScrollArea } from '../ui/scroll-area';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function AiAssistantModal({ isOpen, onClose, stores }: AiAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Merhaba! Ben FırsatHaritası asistanıyım. Bugün ne yemek istersin veya neye ihtiyacın var?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        // Simple auto-scroll
        const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollArea) {
            scrollArea.scrollTop = scrollArea.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    // Mock AI Response logic
    setTimeout(() => {
        let responseText = "Hmm, tam anlayamadım.";
        const lowerInput = userMsg.toLowerCase();

        if (lowerInput.includes('aç') || lowerInput.includes('yemek') || lowerInput.includes('restoran')) {
            const foodStores = stores.filter(s => s.category === 'Food');
            const randomStore = foodStores[Math.floor(Math.random() * foodStores.length)];
            responseText = `Karnın açsa sana harika bir önerim var: **${randomStore.name}**! Şu an %${randomStore.discountRate} indirimleri var. ${randomStore.description}`;
        } else if (lowerInput.includes('alışveriş') || lowerInput.includes('kıyafet') || lowerInput.includes('moda')) {
            const shopStores = stores.filter(s => s.category === 'Shopping');
            const randomStore = shopStores[Math.floor(Math.random() * shopStores.length)];
             responseText = `Alışveriş modundaysan **${randomStore.name}** tam sana göre. %${randomStore.discountRate} indirim fırsatını kaçırma!`;
        } else if (lowerInput.includes('sinema') || lowerInput.includes('film') || lowerInput.includes('eğlence')) {
             const entStores = stores.filter(s => s.category === 'Entertainment');
             const randomStore = entStores[Math.floor(Math.random() * entStores.length)];
             responseText = `Eğlence arıyorsan **${randomStore.name}** harika bir seçenek. ${randomStore.description}`;
        } else {
            responseText = "Sana en yakın fırsatları bulabilirim. Yemek, alışveriş veya eğlence... Hangisi ilgini çekiyor?";
        }

        setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
        setIsLoading(false);
    }, 1500);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[70]" />
        <Drawer.Content className="bg-white dark:bg-neutral-900 flex flex-col rounded-t-[2rem] mt-24 fixed bottom-0 left-0 right-0 h-[80vh] z-[80] focus:outline-none">
          <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 mb-4" />
            
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="font-bold text-lg dark:text-white">Fırsat Asistanı</h2>
                    <p className="text-xs text-gray-500">Gemini AI tarafından desteklenmektedir</p>
                </div>
            </div>

            <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollRef}>
                <div className="space-y-4 pb-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary/10'}`}>
                                    {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-primary text-white rounded-tr-none' 
                                    : 'bg-gray-100 dark:bg-white/5 dark:text-gray-200 rounded-tl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="flex gap-2 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="mt-4 flex gap-2">
                <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Bir şeyler sor..." 
                    className="rounded-full h-12 bg-gray-50 dark:bg-white/5 border-transparent focus:border-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                    onClick={handleSend}
                    size="icon" 
                    className="rounded-full h-12 w-12 shrink-0 bg-primary hover:bg-primary/90"
                >
                    <Send className="w-5 h-5" />
                </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
