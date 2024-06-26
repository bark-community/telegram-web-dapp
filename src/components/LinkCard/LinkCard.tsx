import { Link } from 'react-router-dom';
import { cnTw } from '@/common/utils/twMerge';
import { BodyText, HelpText, Icon, Plate } from '@/components';
import { IconNames } from '../Icon/types';

type Props = {
  text: string;
  href?: string;
  iconName?: IconNames;
  helpText?: string;
  valueText?: string;
  showArrow?: boolean;
  iconClassName?: string;
  textClassName?: string;
  className?: string;
  wrapperClassName?: string;
  onClick?: () => void;
};

const LinkCard: React.FC<Props> = ({
  href = '',
  iconName,
  className = '',
  iconClassName = '',
  wrapperClassName = '',
  text,
  textClassName = '',
  helpText,
  valueText,
  showArrow = true,
  onClick,
}: Props) => {
  const plateClasses = cnTw(`w-full p-0 hover:bg-bg-item-pressed active:bg-bg-item-pressed`, wrapperClassName);
  const linkClasses = cnTw(`w-full grid grid-cols-[auto,1fr,auto] items-center gap-3 min-h-[56px] px-4`, className);

  return (
    <Plate className={plateClasses}>
      <Link to={href} className={linkClasses} onClick={onClick}>
        {iconName && <Icon name={iconName} className={cnTw(`w-10 h-10`, iconClassName)} />}
        <div className="grid">
          <BodyText align="left" className={textClassName}>
            {text}
          </BodyText>
          {helpText && <HelpText className="text-text-hint">{helpText}</HelpText>}
        </div>
        {valueText && <BodyText className="text-text-hint">{valueText}</BodyText>}
        {showArrow && <Icon name="ChevronForward" className="w-4 h-4 self-center" />}
      </Link>
    </Plate>
  );
};

export default LinkCard;
