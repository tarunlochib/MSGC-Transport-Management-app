import React, { useEffect, useRef } from 'react';

const ProgressSteps = ({ steps, currentStep }) => {
  const scrollContainerRef = useRef(null);
  const stepRefs = useRef({});

  // Auto-scroll to current step when it changes
  useEffect(() => {
    const currentStepRef = stepRefs.current[currentStep];
    const scrollContainer = scrollContainerRef.current;
    
    if (currentStepRef && scrollContainer) {
      // Simple and direct scroll logic
      const scrollToStep = () => {
        // Get the current step's position
        const stepLeft = currentStepRef.offsetLeft;
        const stepWidth = currentStepRef.offsetWidth;
        const containerWidth = scrollContainer.offsetWidth;
        
        // Calculate the center position of the step
        const stepCenter = stepLeft + (stepWidth / 2);
        
        // Calculate the center position of the container
        const containerCenter = containerWidth / 2;
        
        // Calculate how much to scroll to center the step
        const scrollAmount = stepCenter - containerCenter;
        
        // Apply the scroll
        scrollContainer.scrollLeft = scrollContainer.scrollLeft + scrollAmount;
      };

      // Execute scroll with multiple attempts
      scrollToStep();
      
      // Retry after a short delay
      setTimeout(scrollToStep, 100);
      
      // Final attempt after longer delay
      setTimeout(scrollToStep, 300);
    }
  }, [currentStep]);

  return (
    <div className="animate-slideUp" style={{ animationDelay: '100ms' }}>
      <div className="bg-white shadow-md rounded-lg border border-gray-100 p-4">
        <nav aria-label="Progress">
          {/* Desktop/Tablet Layout - Horizontal with scroll */}
          <div className="hidden md:block">
            <div className="relative">
              <div 
                ref={scrollContainerRef}
                className="overflow-x-auto progress-steps-scroll pb-2"
              >
                <ol className="flex items-center space-x-4 min-w-max">
                  {steps.map((step, stepIdx) => (
                    <li 
                      key={step.name} 
                      className="flex items-center flex-shrink-0"
                      ref={el => stepRefs.current[step.id] = el}
                    >
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          step.id < currentStep
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                            : step.id === currentStep
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg animate-pulse scale-110 shadow-xl'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {step.id < currentStep ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-sm font-medium">{step.id}</span>
                          )}
                        </div>
                        <div className="ml-3 min-w-0">
                          <p className={`text-sm font-medium transition-colors duration-300 ${
                            step.id <= currentStep ? 'text-blue-600' : 'text-gray-500'
                          } ${step.id === currentStep ? 'animate-pulse' : ''}`}>
                            {step.name}
                          </p>
                          <p className={`text-xs transition-colors duration-300 ${
                            step.id <= currentStep ? 'text-blue-500' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                      {stepIdx !== steps.length - 1 && (
                        <div className="flex-1 mx-4 h-px bg-gray-200 min-w-[2rem]"></div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Vertical */}
          <div className="md:hidden">
            <ol className="space-y-3">
              {steps.map((step) => (
                <li 
                  key={step.name} 
                  className="flex items-start"
                  ref={el => stepRefs.current[step.id] = el}
                >
                  <div className="flex items-center flex-shrink-0">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.id < currentStep
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : step.id === currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg animate-pulse scale-110 shadow-xl'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.id < currentStep ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      step.id <= currentStep ? 'text-blue-600' : 'text-gray-500'
                    } ${step.id === currentStep ? 'animate-pulse' : ''}`}>
                      {step.name}
                    </p>
                    <p className={`text-xs transition-colors duration-300 mt-1 ${
                      step.id <= currentStep ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default ProgressSteps; 