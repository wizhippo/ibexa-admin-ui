<?php

/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
declare(strict_types=1);

namespace Ibexa\AdminUi\Behat\Page;

use Behat\Mink\Session;
use EzSystems\Behat\API\ContentData\FieldTypeNameConverter;
use Ibexa\Behat\Browser\Element\Criterion\ElementTextCriterion;
use Ibexa\Behat\Browser\Element\ElementInterface;
use Ibexa\Behat\Browser\Locator\VisibleCSSLocator;
use Ibexa\Behat\Browser\Routing\Router;
use Ibexa\AdminUi\Behat\Component\Notification;
use Ibexa\AdminUi\Behat\Component\RightMenu;

class ContentTypeUpdatePage extends AdminUpdateItemPage
{
    /** @var \Ibexa\AdminUi\Behat\Component\Notification */
    private $notification;

    public function __construct(
        Session $session,
        Router $router,
        RightMenu $rightMenu,
        Notification $notification
    ) {
        parent::__construct($session, $router, $rightMenu);
        $this->notification = $notification;
    }

    public function fillFieldDefinitionFieldWithValue(string $fieldName, string $label, string $value)
    {
        $this->expandFieldDefinition($fieldName);

        $this->getFieldDefinition($fieldName)
            ->findAll($this->getLocator('field'))->getByCriterion(new ElementTextCriterion($label))
            ->find($this->getLocator('fieldInput'))->setValue($value);
    }

    public function expandFieldDefinition(string $fieldName): void
    {
        $fieldDefinition = $this->getFieldDefinition($fieldName);

        if ($fieldDefinition->hasClass($this->getLocator('fieldCollapsed')->getSelector())) {
            // TODO: Convert to normal click once this page is redesigned
            $this->getSession()->executeScript("document.querySelector('.ibexa-card--toggle-group:last-of-type .ibexa-card__body-display-toggler').click()");
        }
    }

    public function specifyLocators(): array
    {
        return array_merge(parent::specifyLocators(), [
            new VisibleCSSLocator('fieldTypesList', '#ezplatform_content_forms_contenttype_update_fieldTypeSelection'),
            new VisibleCSSLocator('addFieldDefinition', '#ezplatform_content_forms_contenttype_update_addFieldDefinition'),
            new VisibleCSSLocator('fieldDefinitionContainer', '.ibexa-card--toggle-group'),
            new VisibleCSSLocator('fieldDefinitionName', '.ibexa-card--toggle-group .ibexa-card__header .form-check-label'),
            new VisibleCSSLocator('field', '.form-group'),
            new VisibleCSSLocator('fieldBody', 'ibexa-card__body'),
            new VisibleCSSLocator('fieldCollapsed', 'ibexa-card--collapsed'),
            new VisibleCSSLocator('fieldDefinitionToggler', '.ibexa-card__body-display-toggler'),
        ]);
    }

    public function addFieldDefinition(string $fieldName)
    {
        $this->getHTMLPage()->find($this->getLocator('fieldTypesList'))->selectOption($fieldName);
        sleep(1); // TODO: Remove sleep once this page is redesigned
        $this->getHTMLPage()->find($this->getLocator('addFieldDefinition'))->click();
        $this->getFieldDefinition($fieldName)->assert()->isVisible();
        $this->notification->verifyIsLoaded();
        $this->notification->verifyAlertSuccess();
        $this->notification->closeAlert();
    }

    private function getFieldDefinition($fieldName): ElementInterface
    {
        $fieldTypeIdentifier = FieldTypeNameConverter::getFieldTypeIdentifierByName($fieldName);

        return $this->getHTMLPage()
            ->findAll($this->getLocator('fieldDefinitionContainer'))
            ->filter(function (ElementInterface $element) use ($fieldTypeIdentifier) {
                return false !== strpos($element->find($this->getLocator('fieldDefinitionName'))->getText(), $fieldTypeIdentifier);
            })
            ->first()
        ;
    }
}