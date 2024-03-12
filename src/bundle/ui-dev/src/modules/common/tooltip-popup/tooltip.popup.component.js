import React, { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../icon/icon';
import { getTranslator } from '@ibexa-admin-ui/src/bundle/Resources/public/js/scripts/helpers/context.helper';

const INITIAL_HEIGHT = 'initial';
const HEADER_HEIGHT = 35;

const TooltipPopupComponent = (props) => {
    const contentRef = useRef();
    const [maxHeight, setMaxHeight] = useState(INITIAL_HEIGHT);

    // useLayoutEffect(() => {
    //     const { top, height } = contentRef.current.getBoundingClientRect();
    //     const topRounded = Math.round(top);

    //     if (topRounded < HEADER_HEIGHT) {
    //         setMaxHeight(height + topRounded - HEADER_HEIGHT);
    //     } else if (topRounded > HEADER_HEIGHT) {
    //         setMaxHeight(INITIAL_HEIGHT);
    //     }
    // });

    const attrs = {
        className: 'c-tooltip-popup',
        hidden: !props.visible,
    };
    // const contentStyle =
    //     maxHeight === INITIAL_HEIGHT
    //         ? {}
    //         : {
    //               maxHeight,
    //               overflowY: 'scroll',
    //           };

    return (
        <div {...attrs}>
            <div className="c-tooltip-popup__header">
                <h1 className="c-tooltip-popup__title">{props.title}</h1>
                {props.subtitle && <div className="c-tooltip-popup__subtitle">{props.subtitle}</div>}
            </div>
            <div className="c-tooltip-popup__content" ref={contentRef}>
                {props.children}
            </div>
            {props.showFooter && (
                <div className="c-tooltip-popup__footer">
                    {props.onConfirm && (
                        <button
                            className="btn ibexa-btn ibexa-btn--primary"
                            type="button"
                            onClick={props.onConfirm}
                            {...props.confirmBtnAttrs}
                        >
                            {props.confirmLabel}
                        </button>
                    )}
                    {props.onClose && (
                        <button
                            className="btn ibexa-btn ibexa-btn--secondary"
                            type="button"
                            onClick={props.onClose}
                            {...props.closeBtnAttrs}
                        >
                            {props.closeLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

TooltipPopupComponent.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    children: PropTypes.node.isRequired,
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
    showFooter: PropTypes.bool,
    confirmLabel: PropTypes.string,
    closeLabel: PropTypes.string,
};

TooltipPopupComponent.defaultProps = {
    subtitle: '',
    showFooter: true,
    confirmLabel: () => {
        const Translator = getTranslator();

        return Translator.trans(/*@Desc("Confirm")*/ 'tooltip.confirm_label', {}, 'ibexa_content');
    },
    closeLabel: () => {
        const Translator = getTranslator();

        return Translator.trans(/*@Desc("Close")*/ 'tooltip.close_label', {}, 'ibexa_content');
    },
};

export default TooltipPopupComponent;
