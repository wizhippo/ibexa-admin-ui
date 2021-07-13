<?php

/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
declare(strict_types=1);

namespace Ibexa\AdminUi\Behat\Component\Fields;

use Ibexa\Behat\Browser\Locator\VisibleCSSLocator;

class EmailAddress extends FieldTypeComponent
{
    public function specifyLocators(): array
    {
        return [
            new VisibleCSSLocator('fieldInput', 'input'),
        ];
    }

    public function getFieldTypeIdentifier(): string
    {
        return 'ezemail';
    }
}
