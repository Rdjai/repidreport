import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      id: "item-1",
      question: "How long does it take for authorities to respond?",
      answer:
        "Response times vary based on incident severity and type. Emergency reports are processed immediately, while non-urgent matters typically receive attention within 24-48 hours.",
    },
    {
      id: "item-2",
      question: "Can I submit reports anonymously?",
      answer:
        "Yes, you can choose to submit reports anonymously. However, providing contact information helps authorities follow up if they need additional details.",
    },
    {
      id: "item-3",
      question: "What types of incidents can I report?",
      answer:
        "You can report various incidents including traffic violations, public safety concerns, environmental issues, infrastructure problems, and more.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl lg:py-25 py-10 px-5">
      <h2 className="text-center font-extrabold lg:text-4xl text-3xl mb-20">
        Frequently Asked Questions
      </h2>

      <Accordion type="single" collapsible className="lg:w-[80vw] mx-auto">
        {faqs.map((faq) => (
          <AccordionItem value={faq.id} key={faq.id}>
            <AccordionTrigger className="text-left font-medium lg:text-lg text-base">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="lg:text-base text-sm text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQSection;
