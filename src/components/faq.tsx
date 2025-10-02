'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
// import { useUser } from '@clerk/nextjs'
// import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

export default function FAQsTwo() {
  // const {user} = useUser()
    const faqItems = [
        {
            id: 'item-1',
            question: 'How long does it take to create a project?',
            answer: 'It takes just under a minute to create a project over congming. The majorirty of being consumed by the RAG pipeline responsible for creating summaries, embedding for each file and commits from your repository. ',
        },
        {
            id: 'item-2',
            question: 'Do I need to Github Token to use Congming?',
            answer: `No, you don't need a github token at all to interact with ant codebase unless it's private repository.`,
        },
        {
            id: 'item-3',
            question: 'How fast is the scanning agent and what does it do?',
            answer: `Congming uses cerebrus cloud inferencing so, it's really fast when I say fast. Maybe like 10 seconds or even less to scan. The agents scans for vulnerabilities in your codebase automatically opens issues inside your github repository based on their severity if the need be.`,
        },
        {
            id: 'item-4',
            question: 'Is the refactoring agent fast and reliable as well?',
            answer: "Yes absolutely, the refactoring agent is super fast and extremely reliable as well thanks to llama 3.3 70B model.",
        },
        {
            id: 'item-5',
            question: 'What is the purpose of auido pipeline?',
            answer: "In case you missed any of your meetings, upload the audio and Congming will process the audio with the help of it's audio pipeline powered by assembly AI and provide you with only important insights you need to hear.",
        },
        {
            id: 'item-6',
            question: 'What if I run out of credits?',
            answer: 'Congming offers a credit based product usage system. If you run out of credits, buy credits only according to your need. Besides it offers a generous 300 free credits for all new signups... maybe use another email ahahah.',
        },
    ]

    return (
        <section id='faq' className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 text-balance">Discover quick and comprehensive answers to common questions about the platform, services, and features.</p>
                </div>

                <div className="mx-auto mt-12 max-w-xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dashed">
                                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-base">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    
                </div>
            </div>
        </section>
    )
}