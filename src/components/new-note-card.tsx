import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'


interface NewNoteCardProps {
    onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null 

export function NewNoteCard({onNoteCreated}: NewNoteCardProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
    const [content, setContent] = useState('')

    function handleStartEditor() {
        setShouldShowOnboarding(false)
    }

    function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
        setContent(event.target.value)

        if(event.target.value === "") {
            setShouldShowOnboarding(true)
        }
    }

    function handleSaveNote(event: FormEvent) {
        event.preventDefault()

        if (content === '') {
            return
        }

        onNoteCreated(content)

        setContent('')
        setShouldShowOnboarding(true)

        toast.success('Nota criada com sucesso!')
    }

    function handleStartRecording() {
        const isSpeechRecognitionAPIAvalable = 'SpeechRecognition' in window
        || 'webkitSpeechRecognition' in window

        if (!isSpeechRecognitionAPIAvalable) {
            alert('Infelizmente seu navegador não suporta a API de gravação!')
            return
        }

        setIsRecording (true)
        setShouldShowOnboarding (false)

        const speechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        speechRecognition = new speechRecognitionAPI()

        speechRecognition.lang = 'pt-BR'
        speechRecognition.continuous = true
        speechRecognition.maxAlternatives = 1
        speechRecognition.interimResults = true

        speechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, '')

            setContent(transcription)
        }

        speechRecognition.onerror = (event) => {
            console.log(event)
        }

        speechRecognition.start()
    }

    function handleStopRecording() {
        setIsRecording(false)

        if (speechRecognition != null) {
            speechRecognition.stop()
        }

    }

    return (
        <Dialog.Root>
            <Dialog.Trigger className='flex flex-col text-left rounded-md gap-3 bg-slate-700 p-5 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-1 focus-visible:ring-lime-400'>
              <span className='text-sm font-medium text-slate-200'>
                Adicionar uma nota
              </span>
              <p className='text-sm leading-6 text-slate-400'>
                Grave uma nota em áudio que será convertida para texto automaticamente
              </p>
            </Dialog.Trigger>

            <Dialog.DialogPortal>
                <Dialog.DialogOverlay className='inset-0 fixed bg-black/50'/>
                <Dialog.DialogContent className='fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none overflow-hidden'>
                    <Dialog.Close className='absolute top-0 right-0 p-1.5 bg-slate-800 text-slate-400 hover:text-slate-100'>
                        <X className='size-5' />
                    </Dialog.Close>
                    <form className='flex-1 flex flex-col'>
                        <div className='flex flex-1 flex-col gap-3 p-5'>
                            <span className='text-sm font-medium text-slate-200'>
                                Adicionar nota
                            </span>
                        
                            {shouldShowOnboarding ? (
                                <p
                                    className='text-sm leading-6 text-slate-400'
                                >Comece{" "}
                                    <button
                                        type='button'
                                        className='text-lime-400 font-medium hover:underline'
                                        onClick={handleStartRecording}
                                    >gravando uma nota
                                    </button>
                                {" "}em áudio ou se preferir{" "}
                                    <button
                                        type='button'
                                        className='text-lime-400 font-medium hover:underline'
                                        onClick={handleStartEditor}
                                    > utilize apenas texto
                                    </button>
                                    .
                                </p>
                            ) : (
                                <textarea
                                    autoFocus
                                    className='outline-none flex-1 text-sm leading-6 text-slate-400 bg-transparent resize-none'
                                    onChange={handleContentChanged}
                                    value={content}
                                />
                            )}
                        
                        </div>

                        {isRecording ? (
                            <button
                                type='button'
                                className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm font-medium text-slate-300 outline-none hover:text-slate-100'
                                onClick={handleStopRecording}
                            >
                                <div className='size-3 rounded-full bg-red-500 animate-pulse'/>
                                Gravando! (Clique p/ interromper)
                            </button>
                        ) : (
                            <button
                                type='button'
                                className='w-full bg-lime-400 py-4 text-center text-sm font-medium text-lime-950 outline-none hover:bg-lime-500'
                                onClick={handleSaveNote}
                            >
                                Salvar nota
                            </button>
                        )}        

                        
                    </form>

                </Dialog.DialogContent>

            </Dialog.DialogPortal>
        </Dialog.Root>
    )
}