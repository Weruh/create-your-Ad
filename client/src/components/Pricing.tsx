import Title from './Title';
import { PricingTable } from '@clerk/react';

export default function Pricing() {
    
    return (
        <section id="pricing" className="py-20 bg-white/3 border-t border-white/6">
            <div className="max-w-6xl mx-auto px-4">

                <Title
                    title="Pricing"
                    heading="Pricing Plans"
                    description="Our Pricing Plans are simple,transparent and flexible.Choose the plan the best suits your needs."
                />

                <div className="flex flex-wrap items-center justify-center max-w-5xl mx-auto">
                    <PricingTable appearance={{ variables: {colorBackground : 'none'},
                    elements: {
                        PricingTableCardBody : 'bg-white/6',
                        PricingTableCardHeader : 'bg-white/10',
                        switchThumb: 'bg-white'
                    }
                    }} />
                </div>
            </div>
        </section>
    );
};