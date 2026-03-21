import Title from './Title';
import { PricingTable } from '@clerk/react';

export default function Pricing() {
    
    return (
        <section id="pricing" className="border-t border-slate-200/80 bg-white/60 py-20 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4">

                <Title
                    title="Pricing"
                    heading="Pricing Plans"
                    description="Our Pricing Plans are simple,transparent and flexible.Choose the plan the best suits your needs."
                />

                <div className="surface-panel mx-auto flex max-w-5xl flex-wrap items-center justify-center p-4 md:p-6">
                    <PricingTable appearance={{ variables: {colorBackground : 'transparent'},
                    elements: {
                        PricingTableCardBody : 'bg-white',
                        PricingTableCardHeader : 'bg-slate-50',
                        switchThumb: 'bg-white'
                    }
                    }} />
                </div>
            </div>
        </section>
    );
};
