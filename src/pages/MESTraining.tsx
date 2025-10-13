import React, { useState } from 'react';
import { Play, CheckCircle, Clock, BookOpen, Award, ArrowRight } from 'lucide-react';

interface QuizAnswer {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'text' | 'multiple-select';
  answers?: QuizAnswer[];
  correctAnswers?: string[];
}

const MESTraining: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<number | null>(null);
  
  // Separate quiz state for each module
  const [moduleQuizState, setModuleQuizState] = useState<Record<number, {
    showQuiz: boolean;
    quizAnswers: Record<string, string | string[]>;
    quizSubmitted: boolean;
    quizAttempts: number;
    showResults: boolean;
  }>>({});

  // Helper function to get quiz state for a specific module
  const getQuizState = (moduleId: number) => {
    return moduleQuizState[moduleId] || {
      showQuiz: false,
      quizAnswers: {},
      quizSubmitted: false,
      quizAttempts: 0,
      showResults: false
    };
  };

  // Helper function to update quiz state for a specific module
  const updateQuizState = (moduleId: number, updates: Partial<typeof moduleQuizState[number]>) => {
    setModuleQuizState(prev => ({
      ...prev,
      [moduleId]: {
        ...getQuizState(moduleId),
        ...updates
      }
    }));
  };

  const modules = [
    {
      id: 1,
      title: 'Introduction and Overview',
      description: 'Learn the key differences between traditional MES modernizations and Minnesota\'s innovative approach.',
      objectives: [
        'Describe the key differences between traditional MES modernizations and Minnesota\'s MES modernization strategy',
        'Express your excitement for trying something new',
        'Name the key elements of the MES modernization strategy',
        'Be able to engage with the remaining MES modernization strategy content published as part of the MES modernization RFI'
      ],
      units: [
        {
          title: 'RFI Introduction',
          videoUrl: 'https://vimeo.com/showcase/11751697?video=1092859669',
          duration: '8 min'
        },
        {
          title: 'RFI Summary',
          videoUrl: 'https://vimeo.com/showcase/11751697?video=1092859589',
          duration: '7 min'
        }
      ],
      hasQuiz: true
    },
    {
      id: 2,
      title: 'Challenges Diagnosis',
      description: 'Understand the root cause issues preventing successful MES modernizations.',
      objectives: [
        'List the five summary root-cause challenges highlighted by the strategic challenges diagnosis',
        'Identify the difference between a root-cause challenge and a symptomatic challenge',
        'List two failure modes identified by the strategy for delivering enterprise modernization initiatives',
        'Identify modernization and governance structures in place today that continue to amplify the identified challenges'
      ],
      units: [
        {
          title: 'IT Delivery Model Challenges',
          videoUrl: 'https://vimeo.com/showcase/11751697?video=1092483826',
          duration: '10 min'
        },
        {
          title: 'Current-State Environment Challenges',
          videoUrl: 'https://vimeo.com/showcase/11751697?video=1092857018',
          duration: '15 min'
        },
        {
          title: 'Modernization and Governance Challenges',
          videoUrl: 'https://vimeo.com/showcase/11751697?video=1092859262',
          duration: '10 min'
        },
        {
          title: 'Enterprise Architecture Challenges',
          videoUrl: 'https://vimeo.com/showcase/11751697?video=1092859319',
          duration: '20 min'
        }
      ],
      hasQuiz: true
    },
    {
      id: 3,
      title: 'Guiding Approach Tenets',
      description: 'Learn the key operating commitments Minnesota has made to address diagnosed challenges.',
      objectives: [
        'List and define the eight guiding approach tenets proposed as operational commitments in the MES modernization strategy',
        'Describe the key guiding tenet that differentiates the MES modernization strategy from other state modernization efforts',
        'Describe the phasing structure and cutover approach anticipated when applying the guiding approach tenets',
        'Apply the guiding approach tenets to solve a challenge'
      ],
      units: [
        {
          title: 'Guiding Approach Tenets Summary',
          videoUrl: 'https://vimeo.com/showcase/11751697?video=1092859344',
          duration: '17 min'
        },
        {
          title: 'Deliver with Purpose',
          videoUrl: 'https://vimeo.com/showcase/11751697?video=1092859479',
          duration: '10 min'
        }
      ],
      hasQuiz: true
    },
    {
      id: 4,
      title: 'Coherent Action Plan',
      description: 'Explore the actionable framework for applying the guiding approach tenets to address the diagnosed challenges.',
      objectives: [
        'Describe the future-state vision for MES modernization',
        'Name the outcome focus areas identified as the first areas of focus for the MES modernization strategy',
        'List the first narrow set of business conditions identified to establish the central capabilities needed to support the Medicaid enterprise',
        'Look up the specific outcomes and measures targeted as part of the initial effort',
        'Describe the procurement "bake-off" approach proposed in the strategy for engaging and performance managing vendors during the innovation phase',
        'Describe the executive engagement and support that will be needed to define, protect, and insulate the cucumber water environment'
      ],
      units: [
        {
          title: 'Summary Document',
          videoUrl: 'https://mn.gov/dhs/assets/mn-mes-modernization-strategy-summary_tcm1053-700627.pdf',
          duration: '60 min',
          isPdf: true
        },
        {
          title: 'Coherent Action Plan',
          videoUrl: 'https://vimeo.com/showcase/11751697?video=1110292309',
          duration: '30 min'
        }
      ],
      hasQuiz: false
    }
  ];

  const getQuizQuestions = (moduleId: number): QuizQuestion[] => {
    if (moduleId === 1) {
      return [
        {
          id: 'q1',
          question: 'What is the difference between traditional MES modernizations and Minnesota\'s MES modernization strategy?',
          type: 'multiple-choice',
          answers: [
            {
              id: 'q1a1',
              text: 'Traditional: Focus on enterprise architecture definition | Minnesota\'s strategy: Allows architecture to emerge from experimentation using high-level future-state criteria'
            },
            {
              id: 'q1a2',
              text: 'Traditional: procurements focus on only allowing vendors with extensive MES experience | Minnesota\'s strategy: lowers the barrier to entry to encourage new thinking, innovation, and competition'
            },
            {
              id: 'q1a3',
              text: 'Traditional: Scope defined as modules and solutions | Minnesota\'s strategy: scope defined as outcomes'
            },
            {
              id: 'q1a4',
              text: 'Traditional: Extensive planning, requirements gathering, alternatives analysis, and product evaluation | Minnesota\'s strategy: apply guiding approach tenets in an action plan as soon as possible'
            },
            {
              id: 'q1a5',
              text: 'All of the above',
              isCorrect: true
            }
          ]
        },
        {
          id: 'q2',
          question: 'What are you most excited about regarding Minnesota\'s MES modernization strategy?',
          type: 'text'
        },
        {
          id: 'q3',
          question: 'Identify core elements of the MES modernization strategy (select all that apply)',
          type: 'multiple-select',
          answers: [
            {
              id: 'q3a1',
              text: 'Coherent Action Plan',
              isCorrect: true
            },
            {
              id: 'q3a2',
              text: 'MITA State Self-Assessment'
            },
            {
              id: 'q3a3',
              text: 'Challenges Diagnosis',
              isCorrect: true
            },
            {
              id: 'q3a4',
              text: 'Guiding Approach Tenets',
              isCorrect: true
            },
            {
              id: 'q3a5',
              text: 'Product Evaluation and Alternatives Analysis'
            }
          ],
          correctAnswers: ['q3a1', 'q3a3', 'q3a4']
        }
      ];
    } else if (moduleId === 2) {
      return [
        {
          id: 'm2q1',
          question: 'Which of the following are root-cause challenges identified in Minnesota\'s MES modernization strategy (not just symptoms)?',
          type: 'multiple-select',
          answers: [
            {
              id: 'm2q1a1',
              text: 'Misaligned or unclear scope',
              isCorrect: true
            },
            {
              id: 'm2q1a2',
              text: 'Lack of outcome clarity and ownership',
              isCorrect: true
            },
            {
              id: 'm2q1a3',
              text: 'Extended lead times that impede feedback and learning',
              isCorrect: true
            },
            {
              id: 'm2q1a4',
              text: 'Significant organizational change and shifting priorities'
            },
            {
              id: 'm2q1a5',
              text: 'Technical debt and limited integration capability'
            }
          ],
          correctAnswers: ['m2q1a1', 'm2q1a2', 'm2q1a3']
        },
        {
          id: 'm2q2',
          question: 'Why does the strategy emphasize distinguishing between root-cause challenges and symptomatic challenges? How does this distinction help guide modernization efforts?',
          type: 'text'
        },
        {
          id: 'm2q3',
          question: 'Which two "failure modes" does Minnesota\'s strategy highlight as common pitfalls in modernization?',
          type: 'multiple-select',
          answers: [
            {
              id: 'm2q3a1',
              text: 'Modernizing peripheral modules first without addressing foundational issues',
              isCorrect: true
            },
            {
              id: 'm2q3a2',
              text: 'Building foundational layers without business context',
              isCorrect: true
            },
            {
              id: 'm2q3a3',
              text: 'Over-reliance on waterfall planning cycles'
            },
            {
              id: 'm2q3a4',
              text: 'Ignoring vendor input during requirements gathering'
            }
          ],
          correctAnswers: ['m2q3a1', 'm2q3a2']
        },
        {
          id: 'm2q4',
          question: 'How does Minnesota\'s use of "slices" and the "bake-off" process aim to address entrenched governance and structural challenges?',
          type: 'multiple-choice',
          answers: [
            {
              id: 'm2q4a1',
              text: 'By consolidating all procurement into a single RFP to reduce duplication'
            },
            {
              id: 'm2q4a2',
              text: 'By breaking down modernization into smaller, outcome-driven experiments that can be tested and scaled',
              isCorrect: true
            },
            {
              id: 'm2q4a3',
              text: 'By outsourcing decision-making to vendors directly'
            },
            {
              id: 'm2q4a4',
              text: 'By limiting vendor participation to only those with prior MES experience'
            }
          ]
        },
        {
          id: 'm2q5',
          question: 'Current governance structures and processes often create long decision cycles and slow progress. Based on the videos, what risks do extended lead times pose for modernization, and how do they affect vendor participation?',
          type: 'text'
        }
      ];
    } else if (moduleId === 3) {
      return [
        {
          id: 'm3q1',
          question: 'Which of the following best describes the eight guiding approach tenets in Minnesota\'s MES modernization strategy?',
          type: 'multiple-choice',
          answers: [
            {
              id: 'm3q1a1',
              text: 'They are optional considerations that vendors may use if convenient'
            },
            {
              id: 'm3q1a2',
              text: 'They are philosophical commitments shaping how modernization is carried out',
              isCorrect: true
            },
            {
              id: 'm3q1a3',
              text: 'They are technical specifications vendors must follow exactly'
            },
            {
              id: 'm3q1a4',
              text: 'They are compliance requirements tied to federal funding'
            }
          ]
        },
        {
          id: 'm3q2',
          question: 'Which guiding tenet most clearly differentiates Minnesota\'s strategy from other state modernization efforts?',
          type: 'multiple-choice',
          answers: [
            {
              id: 'm3q2a1',
              text: 'Focus on MITA self-assessment first'
            },
            {
              id: 'm3q2a2',
              text: 'Early and frequent alternatives analysis'
            },
            {
              id: 'm3q2a3',
              text: 'Outcome-driven delivery and safe-to-fail experimentation',
              isCorrect: true
            },
            {
              id: 'm3q2a4',
              text: 'Relying on established incumbent vendors'
            }
          ]
        },
        {
          id: 'm3q3',
          question: 'Which are examples of guiding approach tenets in the MES strategy? (select all that apply)',
          type: 'multiple-select',
          answers: [
            {
              id: 'm3q3a1',
              text: 'Coherent Action Plan',
              isCorrect: true
            },
            {
              id: 'm3q3a2',
              text: 'Bake-Off Evaluation and Slices',
              isCorrect: true
            },
            {
              id: 'm3q3a3',
              text: 'Guiding Approach Tenets Summary'
            },
            {
              id: 'm3q3a4',
              text: 'Deliver with Purpose',
              isCorrect: true
            },
            {
              id: 'm3q3a5',
              text: 'MITA State Self-Assessment'
            }
          ],
          correctAnswers: ['m3q3a1', 'm3q3a2', 'm3q3a4']
        },
        {
          id: 'm3q4',
          question: 'Describe how the phasing structure and cutover approach are expected to work when applying the guiding approach tenets.',
          type: 'text'
        },
        {
          id: 'm3q5',
          question: 'Imagine you are a vendor preparing a proposal. How could you use the "Deliver with Purpose" tenet to frame your approach?',
          type: 'multiple-choice',
          answers: [
            {
              id: 'm3q5a1',
              text: 'By focusing on compliance checklists only'
            },
            {
              id: 'm3q5a2',
              text: 'By emphasizing small slices of work that clearly demonstrate measurable outcomes',
              isCorrect: true
            },
            {
              id: 'm3q5a3',
              text: 'By prioritizing speed of delivery over value or outcomes'
            },
            {
              id: 'm3q5a4',
              text: 'By re-using existing modules without connecting them to enterprise outcomes'
            }
          ]
        }
      ];
    }
    return [];
  };

  const quizQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'What is the difference between traditional MES modernizations and Minnesota\'s MES modernization strategy?',
      type: 'multiple-choice',
      answers: [
        {
          id: 'q1a1',
          text: 'Traditional: Focus on enterprise architecture definition | Minnesota\'s strategy: Allows architecture to emerge from experimentation using high-level future-state criteria'
        },
        {
          id: 'q1a2',
          text: 'Traditional: procurements focus on only allowing vendors with extensive MES experience | Minnesota\'s strategy: lowers the barrier to entry to encourage new thinking, innovation, and competition'
        },
        {
          id: 'q1a3',
          text: 'Traditional: Scope defined as modules and solutions | Minnesota\'s strategy: scope defined as outcomes'
        },
        {
          id: 'q1a4',
          text: 'Traditional: Extensive planning, requirements gathering, alternatives analysis, and product evaluation | Minnesota\'s strategy: apply guiding approach tenets in an action plan as soon as possible'
        },
        {
          id: 'q1a5',
          text: 'All of the above',
          isCorrect: true
        }
      ]
    },
    {
      id: 'q2',
      question: 'What are you most excited about regarding Minnesota\'s MES modernization strategy?',
      type: 'text'
    },
    {
      id: 'q3',
      question: 'Identify core elements of the MES modernization strategy (select all that apply)',
      type: 'multiple-select',
      answers: [
        {
          id: 'q3a1',
          text: 'Coherent Action Plan',
          isCorrect: true
        },
        {
          id: 'q3a2',
          text: 'MITA State Self-Assessment'
        },
        {
          id: 'q3a3',
          text: 'Challenges Diagnosis',
          isCorrect: true
        },
        {
          id: 'q3a4',
          text: 'Guiding Approach Tenets',
          isCorrect: true
        },
        {
          id: 'q3a5',
          text: 'Product Evaluation and Alternatives Analysis'
        }
      ],
      correctAnswers: ['q3a1', 'q3a3', 'q3a4']
    }
  ];

  const handleQuizAnswer = (moduleId: number, questionId: string, answerId: string | string[]) => {
    const currentState = getQuizState(moduleId);
    updateQuizState(moduleId, {
      quizAnswers: {
        ...currentState.quizAnswers,
        [questionId]: answerId
      }
    });
  };

  const handleMultiSelectAnswer = (moduleId: number, questionId: string, answerId: string, checked: boolean) => {
    const currentState = getQuizState(moduleId);
    const currentAnswers = (currentState.quizAnswers[questionId] as string[]) || [];
    
    let newAnswers;
    if (checked) {
      newAnswers = [...currentAnswers, answerId];
    } else {
      newAnswers = currentAnswers.filter(id => id !== answerId);
    }
    
    updateQuizState(moduleId, {
      quizAnswers: {
        ...currentState.quizAnswers,
        [questionId]: newAnswers
      }
    });
  };

  const submitQuiz = (moduleId: number) => {
    const currentState = getQuizState(moduleId);
    updateQuizState(moduleId, {
      quizAttempts: currentState.quizAttempts + 1,
      showResults: true
    });
    
    // Check if all questions are correct
    const { correct, total } = getQuizScore(moduleId);
    if (correct === total) {
      updateQuizState(moduleId, {
        quizAttempts: currentState.quizAttempts + 1,
        showResults: true,
        quizSubmitted: true
      });
    }
  };

  const retakeQuiz = (moduleId: number) => {
    updateQuizState(moduleId, {
      showResults: false,
      quizAnswers: {}
    });
  };

  const startQuiz = (moduleId: number) => {
    updateQuizState(moduleId, {
      showQuiz: true,
      quizAnswers: {},
      showResults: false,
      quizSubmitted: false,
      quizAttempts: 0
    });
  };

  const getQuizScore = (moduleId: number) => {
    const currentState = getQuizState(moduleId);
    const questions = getQuizQuestions(moduleId);
    let correct = 0;
    let total = questions.length;

    questions.forEach(question => {
      if (question.type === 'multiple-choice') {
        const selectedAnswer = currentState.quizAnswers[question.id] as string;
        const correctAnswer = question.answers?.find(a => a.isCorrect);
        if (selectedAnswer === correctAnswer?.id) {
          correct++;
        }
      } else if (question.type === 'text') {
        // Text questions are always correct if answered
        if (currentState.quizAnswers[question.id]) {
          correct++;
        }
      } else if (question.type === 'multiple-select') {
        const selectedAnswers = (currentState.quizAnswers[question.id] as string[]) || [];
        const correctAnswers = question.correctAnswers || [];
        // Check if arrays have same length and same elements (order doesn't matter)
        const selectedSet = new Set(selectedAnswers);
        const correctSet = new Set(correctAnswers);
        if (selectedSet.size === correctSet.size && 
            [...selectedSet].every(id => correctSet.has(id))) {
          correct++;
        }
      }
    });

    return { correct, total };
  };

  const getAnswerStatus = (moduleId: number, questionId: string, answerId?: string) => {
    const currentState = getQuizState(moduleId);
    const questions = getQuizQuestions(moduleId);
    const question = questions.find(q => q.id === questionId);
    const isFirstAttempt = currentState.quizAttempts === 1;
    
    if (!question || !currentState.showResults) return 'border-gray-200';
    
    if (question.type === 'multiple-choice' && answerId) {
      const selectedAnswer = currentState.quizAnswers[questionId] as string;
      const answer = question.answers?.find(a => a.id === answerId);
      
      if (selectedAnswer === answerId) {
        if (answer?.isCorrect) {
          return 'border-green-500 bg-green-50';
        } else if (!isFirstAttempt) {
          return 'border-red-500 bg-red-50';
        }
      } else if (!isFirstAttempt && answer?.isCorrect) {
        return 'border-green-500 bg-green-50';
      }
    } else if (question.type === 'multiple-select' && answerId) {
      const selectedAnswers = (currentState.quizAnswers[questionId] as string[]) || [];
      const answer = question.answers?.find(a => a.id === answerId);
      const isSelected = selectedAnswers.includes(answerId);
      
      if (isSelected && answer?.isCorrect) {
        return 'border-green-500 bg-green-50';
      } else if (isSelected && !answer?.isCorrect && !isFirstAttempt) {
        return 'border-red-500 bg-red-50';
      } else if (!isSelected && answer?.isCorrect && !isFirstAttempt) {
        return 'border-green-500 bg-green-50';
      }
    } else {
      // For question container
      const questions = getQuizQuestions(moduleId);
      const question = questions.find(q => q.id === questionId);
      if (!question) return 'border-gray-200';
      
      if (question.type === 'text') {
        const hasAnswer = currentState.quizAnswers[questionId];
        return hasAnswer ? 'border-green-500' : (isFirstAttempt ? 'border-gray-200' : 'border-red-500');
      } else if (question.type === 'multiple-choice') {
        const selectedAnswer = currentState.quizAnswers[questionId] as string;
        const correctAnswer = question.answers?.find(a => a.isCorrect);
        const isCorrect = selectedAnswer === correctAnswer?.id;
        return isCorrect ? 'border-green-500' : (isFirstAttempt ? 'border-gray-200' : 'border-red-500');
      } else if (question.type === 'multiple-select') {
        const selectedAnswers = (currentState.quizAnswers[questionId] as string[]) || [];
        const correctAnswers = question.correctAnswers || [];
        const selectedSet = new Set(selectedAnswers);
        const correctSet = new Set(correctAnswers);
        const isCorrect = selectedSet.size === correctSet.size && 
          [...selectedSet].every(id => correctSet.has(id));
        return isCorrect ? 'border-green-500' : (isFirstAttempt ? 'border-gray-200' : 'border-red-500');
      }
    }
    
    return 'border-gray-200';
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-mn-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              MES Modernization Strategy Training
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Training modules to understand Minnesota's innovative approach to MES modernization.
            </p>
          </div>
        </div>
      </section>

      {/* Training Modules */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {modules.map((module) => (
              <div key={module.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-mn-primary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-mn-primary">
                          Module #{module.id} – {module.title}
                        </h2>
                        <p className="text-gray-600 mt-2">{module.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentModule(currentModule === module.id ? null : module.id)}
                      className="inline-flex items-center px-4 py-2 bg-mn-secondary text-white font-semibold rounded-lg hover:bg-mn-accent-teal transition-colors"
                    >
                      {currentModule === module.id ? 'Collapse' : 'Expand'}
                      <ArrowRight className={`ml-2 h-4 w-4 transition-transform ${currentModule === module.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {currentModule === module.id && (
                    <div className="space-y-6">
                      {/* Training Objectives */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-mn-primary mb-4">Training Objectives</h3>
                        <p className="text-gray-700 mb-4">By the end of this module, you should be able to:</p>
                        <ul className="space-y-2">
                          {module.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <CheckCircle className="h-5 w-5 text-mn-secondary flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Units */}
                      <div>
                        <h3 className="text-lg font-semibold text-mn-primary mb-4">Training Units</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {module.units.map((unit, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="bg-mn-accent-teal rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                                  {unit.isPdf ? (
                                    <BookOpen className="h-4 w-4 text-white" />
                                  ) : (
                                    <Play className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-mn-primary">Unit #{index + 1} – {unit.title}</h4>
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Clock className="h-4 w-4" />
                                    <span>{unit.duration}</span>
                                  </div>
                                </div>
                              </div>
                              <a
                                href={unit.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-mn-accent-teal font-semibold hover:text-mn-primary transition-colors"
                              >
                                {unit.isPdf ? 'View Document' : 'Watch Video'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quiz Section */}
                      {false && module.hasQuiz && (
                        <div className="bg-mn-neutral-lightblue bg-opacity-20 rounded-lg p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <Award className="h-6 w-6 text-mn-accent-teal" />
                            <h3 className="text-lg font-semibold text-mn-primary">Module Quiz</h3>
                          </div>
                          
                          {!getQuizState(module.id).showQuiz ? (
                            <div>
                              <p className="text-gray-700 mb-4">
                                Test your knowledge with a short quiz covering the key concepts from this module.
                              </p>
                              <button
                                onClick={() => startQuiz(module.id)}
                                className="inline-flex items-center px-6 py-3 bg-mn-accent-teal text-white font-semibold rounded-lg hover:bg-mn-primary transition-colors"
                              >
                                Start Quiz
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {getQuizQuestions(module.id).map((question, qIndex) => (
                                <div key={question.id} className={`bg-white rounded-lg p-6 border-2 ${getQuizState(module.id).showResults ? getAnswerStatus(module.id, question.id) : 'border-gray-200'}`}>
                                  <h4 className="font-semibold text-mn-primary mb-4">
                                    Question #{qIndex + 1}: {question.question}
                                  </h4>
                                  
                                  {question.type === 'multiple-choice' && question.answers && (
                                    <div className="space-y-3">
                                      {question.answers.map((answer) => (
                                        <label key={answer.id} className={`flex items-start space-x-3 cursor-pointer p-3 rounded-lg border transition-colors ${getQuizState(module.id).showResults ? getAnswerStatus(module.id, question.id, answer.id) : 'border-gray-200 hover:border-gray-300'}`}>
                                          <input
                                            type="radio"
                                            name={question.id}
                                            value={answer.id}
                                            onChange={(e) => handleQuizAnswer(module.id, question.id, e.target.value)}
                                            className="mt-1 text-mn-accent-teal focus:ring-mn-accent-teal"
                                            disabled={getQuizState(module.id).showResults}
                                          />
                                          <span className="text-gray-700">
                                            {answer.text}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  )}

                                  {question.type === 'text' && (
                                    <div className={`rounded-lg border-2 ${getQuizState(module.id).showResults ? (getQuizState(module.id).quizAnswers[question.id] ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-300'}`}>
                                      <textarea
                                        rows={4}
                                        value={getQuizState(module.id).quizAnswers[question.id] as string || ''}
                                        onChange={(e) => handleQuizAnswer(module.id, question.id, e.target.value)}
                                        className="w-full px-4 py-3 bg-transparent focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent border-none rounded-lg"
                                        placeholder="Share your thoughts..."
                                        disabled={getQuizState(module.id).showResults}
                                      />
                                    </div>
                                  )}

                                  {question.type === 'multiple-select' && question.answers && (
                                    <div className="space-y-3">
                                      {question.answers.map((answer) => (
                                        <label key={answer.id} className={`flex items-start space-x-3 cursor-pointer p-3 rounded-lg border transition-colors ${getQuizState(module.id).showResults ? getAnswerStatus(module.id, question.id, answer.id) : 'border-gray-200 hover:border-gray-300'}`}>
                                          <input
                                            type="checkbox"
                                            onChange={(e) => handleMultiSelectAnswer(module.id, question.id, answer.id, e.target.checked)}
                                            className="mt-1 text-mn-accent-teal focus:ring-mn-accent-teal"
                                            disabled={getQuizState(module.id).showResults}
                                          />
                                          <span className="text-gray-700">
                                            {answer.text}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}

                              {!getQuizState(module.id).showResults ? (
                                <div className="text-center">
                                  <button
                                    onClick={() => submitQuiz(module.id)}
                                    className="inline-flex items-center px-8 py-3 bg-mn-primary text-white font-semibold rounded-lg hover:bg-mn-accent-teal transition-colors"
                                  >
                                    Submit Quiz
                                    <Award className="ml-2 h-5 w-5" />
                                  </button>
                                </div>
                              ) : !getQuizState(module.id).quizSubmitted ? (
                                <div className="space-y-4">
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                    <div className="text-yellow-600 mb-4">
                                      <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-yellow-800 mb-2">Keep Trying!</h4>
                                    <p className="text-yellow-700 mb-4">
                                      You scored {getQuizScore(module.id).correct} out of {getQuizScore(module.id).total} questions correctly.
                                      Review the feedback above and try again.
                                    </p>
                                    <p className="text-sm text-yellow-600 mb-4">Attempt #{getQuizState(module.id).quizAttempts}</p>
                                  </div>
                                  <div className="text-center">
                                    <button
                                      onClick={() => retakeQuiz(module.id)}
                                      className="inline-flex items-center px-8 py-3 bg-mn-accent-teal text-white font-semibold rounded-lg hover:bg-mn-primary transition-colors"
                                    >
                                      Try Again
                                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                  <Award className="h-12 w-12 text-mn-secondary mx-auto mb-4" />
                                  <h4 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h4>
                                  <p className="text-green-700 mb-2">
                                    You've successfully completed the quiz with a perfect score!
                                  </p>
                                  <p className="text-sm text-green-600">
                                    Completed in {getQuizState(module.id).quizAttempts} attempt{getQuizState(module.id).quizAttempts !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MESTraining;