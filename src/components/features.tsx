import { CodeIcon, Cpu, FastForward, FileAudio2, FileQuestion, Fingerprint, LaptopMinimalCheck, Pencil, ScanSearchIcon, Settings2, Sparkles, Users, Zap,  } from 'lucide-react'

export default function Features() {
    return (
        <section id='features' className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">The Agent that helps you understand and interact with codebases.</h2>
                    <p>Congming has it all that your fast and hard team needs. Built for developers and busy managers it supports the following features with more to come in future. </p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                  
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {/* <Zap className="size-4" /> */}
                            <ScanSearchIcon  className=' size-4'/>
                            <h3 className="text-sm font-medium">Scan</h3>
                        </div>
                        <p className="text-sm">Let the scanner agent find and list critical issues in your codebase.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <LaptopMinimalCheck  className=' size-4'/>
                            <h3 className="text-sm font-medium">Intelligent</h3>
                        </div>
                        <p className="text-sm">Ask any question about your codebase and get the most perfect and relevant answer.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <CodeIcon  className="size-4"/>
                            <h3 className="text-sm font-medium">Refactor</h3>
                        </div>
                        <p className="text-sm">Let the refactor agent hunt down bad bugs and refactor your codebase.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Users className="size-4"  />
                            <h3 className="text-sm font-medium">Collaborate</h3>
                        </div>
                        <p className="text-sm">Invite your team members to your project and work together.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Zap  className="size-4"/>

                            <h3 className="text-sm font-medium">Fast</h3>
                        </div>
                        <p className="text-sm">Lightning fast response time of agents and pipelines powered by Cerebras inferencing.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FileAudio2 className="size-4" />

                            <h3 className="text-sm font-medium">Transcript</h3>
                        </div>
                        <p className="text-sm">Let AI summarize and tell you all your important stuff from meeting audios.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}