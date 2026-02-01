interface Step {
  number: number;
  title: string;
  href: string;
}

const steps: Step[] = [
  { number: 1, title: 'Documents', href: '/documents' },
  { number: 2, title: 'Bank Details', href: '/bank-details' },
  { number: 3, title: 'Restaurant Info', href: '/restaurant-info' },
  { number: 4, title: 'Menu', href: '/menu' },
  { number: 5, title: 'Location', href: '/location' },
];

interface StepperProps {
  currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${
                    step.number < currentStep
                      ? 'bg-green-500 text-white'
                      : step.number === currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {step.number < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <p
                className={`
                  mt-2 text-xs font-medium text-center
                  ${step.number === currentStep ? 'text-primary-600' : 'text-gray-500'}
                `}
              >
                {step.title}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2
                  ${step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
