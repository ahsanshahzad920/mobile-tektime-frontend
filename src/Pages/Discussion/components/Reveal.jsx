import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function Reveal({ children, delay = 0.25 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-75px" });

    return (
        <motion.div
            ref={ref}
            variants={{
                hidden: { opacity: 0, y: 75 },
                visible: { opacity: 1, y: 0 }
            }}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: delay }}
        >
            {children}
        </motion.div>
    );
}
