interface InsightCardProps {
  insight: {
    type: 'warning' | 'success' | 'info';
    title: string;
    message: string;
    icon: string;
  };
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Get background color based on insight type
  const getBackgroundClass = () => {
    switch (insight.type) {
      case 'warning':
        return 'bg-warningLight border-warning/20';
      case 'success':
        return 'bg-success/10 border-success/20';
      case 'info':
        return 'bg-primary/10 border-primary/20';
      default:
        return 'bg-primary/10 border-primary/20';
    }
  };

  // Get icon color based on insight type
  const getIconColorClass = () => {
    switch (insight.type) {
      case 'warning':
        return 'text-warning';
      case 'success':
        return 'text-success';
      case 'info':
        return 'text-primary';
      default:
        return 'text-primary';
    }
  };

  // Get icon based on insight icon
  const getIcon = () => {
    switch (insight.icon) {
      case 'warning':
        return (
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'savings':
        return (
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'insights':
        return (
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'tips_and_updates':
        return (
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`p-3 rounded-lg ${getBackgroundClass()} border flex items-start`}>
      <span className={`${getIconColorClass()} mr-3 mt-0.5`}>
        {getIcon()}
      </span>
      <div>
        <h3 className="font-medium text-dark">{insight.title}</h3>
        <p className="text-sm text-textDark">{insight.message}</p>
      </div>
    </div>
  );
};

export default InsightCard;
