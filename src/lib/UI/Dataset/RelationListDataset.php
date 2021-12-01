<?php

/**
 * @copyright Copyright (C) Ibexa AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
declare(strict_types=1);

namespace Ibexa\AdminUi\UI\Dataset;

use Ibexa\Contracts\Core\Repository\ContentService;
use Ibexa\Contracts\Core\Repository\Values\Content\Content;
use Ibexa\Contracts\Core\Repository\Values\Content\Relation;
use Ibexa\AdminUi\UI\Value\ValueFactory;

final class RelationListDataset
{
    /** @var \Ibexa\Contracts\Core\Repository\ContentService */
    private $contentService;

    /** @var \Ibexa\AdminUi\UI\Value\ValueFactory */
    private $valueFactory;

    /** @var \Ibexa\AdminUi\UI\Value\Content\RelationInterface[] */
    private $relations;

    /**
     * @param \Ibexa\Contracts\Core\Repository\ContentService $contentService
     * @param \Ibexa\AdminUi\UI\Value\ValueFactory $valueFactory
     */
    public function __construct(ContentService $contentService, ValueFactory $valueFactory)
    {
        $this->contentService = $contentService;
        $this->valueFactory = $valueFactory;
        $this->relations = [];
    }

    /**
     * @param \Ibexa\Contracts\Core\Repository\Values\Content\Content $content
     *
     * @return \Ibexa\AdminUi\UI\Dataset\RelationListDataset
     *
     * @throws \Ibexa\Contracts\Core\Repository\Exceptions\UnauthorizedException
     */
    public function load(
        Content $content
    ): self {
        $versionInfo = $content->getVersionInfo();

        $this->relations = array_map(
            function (Relation $relation) use ($content) {
                return $this->valueFactory->createRelation($relation, $content);
            },
            $this->contentService->loadRelations($versionInfo)
        );

        return $this;
    }

    /**
     * @return \Ibexa\AdminUi\UI\Value\Content\RelationInterface[]
     */
    public function getRelations(): array
    {
        return $this->relations;
    }
}

class_alias(RelationListDataset::class, 'EzSystems\EzPlatformAdminUi\UI\Dataset\RelationListDataset');
