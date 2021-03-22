import React from 'react';
import './OptionCard.scss';

interface OptionCardProps {
  walletName: string,
  onClick?: null | (() => void)
}

const OptionCard = ({
  walletName,
  onClick
}: OptionCardProps) => {

  return (
    <div className="ShareBody">
      <div
        style={styles.infoCard}
        onClick={ () => onClick()}
      >
        {walletName}
      </div>
    </div>
  );
};

export default OptionCard;

const styles = {
  infoCard: {
    backgroundColor: 'transparent',
    padding: '1rem',
    outline: 'none',
    border: '1px solid',
    borderRadius: '12px',
    borderColor: 'blue',
    width: '100% !important',
    $nest: {
      '&:focus': {
        boxShadow: '0 0 0 1px red'
      }
    },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
};